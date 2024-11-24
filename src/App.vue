<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { MapsService } from './services/MapsService';
import { JourneyService } from './services/JourneyService';
import { GeolocationService } from './services/GeolocationService';
import LocationInput from './components/LocationInput.vue';
import DistanceResult from './components/DistanceResult.vue';
import MapView from './components/MapView.vue';
import JourneyControls from './components/JourneyControls.vue';
import type { DistanceCalculatorState, Location, JourneyState } from './types/maps';

const state = ref<DistanceCalculatorState>({
  distance: '',
  error: '',
  loading: false
});

const journeyState = ref<JourneyState>({
  isActive: false,
  totalDistance: 0,
});

const currentLocation = ref<Location>();
const destinationLocation = ref<Location>();
const mapsService = MapsService.getInstance();

onMounted(async () => {
  try {
    await mapsService.initialize();
    const position = await GeolocationService.getCurrentPosition();
    currentLocation.value = {
      lat: position.coords.latitude,
      lng: position.coords.longitude
    };
  } catch (e) {
    state.value.error = 'Failed to load Google Maps or get current location';
  }
});

const calculateDistance = async (destination: string) => {
  state.value = {
    distance: '',
    error: '',
    loading: true
  };

  try {
    if (!currentLocation.value) {
      const position = await GeolocationService.getCurrentPosition();
      currentLocation.value = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };
    }

    const destLocation = await mapsService.geocodeAddress(destination);
    if (!destLocation) {
      throw new Error('Could not find the specified location');
    }

    destinationLocation.value = {
      lat: destLocation.lat(),
      lng: destLocation.lng()
    };

    const distanceInMeters = mapsService.calculateDistance(
      currentLocation.value,
      destinationLocation.value
    );
    
    state.value.distance = `${(distanceInMeters / 1000).toFixed(2)} km`;
  } catch (e) {
    state.value.error = e instanceof Error ? e.message : 'Error calculating distance';
    console.error(e);
  } finally {
    state.value.loading = false;
  }
};

const startJourney = () => {
  journeyState.value = {
    isActive: true,
    startTime: new Date(),
    totalDistance: 0,
    currentLocation: currentLocation.value
  };

  JourneyService.startTracking((location) => {
    if (journeyState.value.currentLocation) {
      journeyState.value.totalDistance += JourneyService.calculateDistance(
        journeyState.value.currentLocation,
        location
      );
    }
    journeyState.value.currentLocation = location;
    currentLocation.value = location;
  });
};

const endJourney = () => {
  journeyState.value.isActive = false;
  journeyState.value.endTime = new Date();
  JourneyService.stopTracking();
};
</script>

<template>
  <div class="container">
    <h1>Distance Calculator</h1>
    
    <LocationInput
      placeholder="Enter destination address"
      :disabled="state.loading"
      @submit="calculateDistance"
    >
      {{ state.loading ? 'Calculating...' : 'Calculate Distance' }}
    </LocationInput>

    <JourneyControls
      :journey-state="journeyState"
      @start="startJourney"
      @end="endJourney"
    />

    <DistanceResult
      :distance="state.distance"
      :error="state.error"
    />

    <MapView
      :origin="currentLocation"
      :destination="destinationLocation"
    />
  </div>
</template>

<style scoped>
.container {
  max-width: 800px;
  margin: 2rem auto;
  padding: 0 1rem;
}

h1 {
  color: #2c3e50;
  margin-bottom: 2rem;
}
</style>