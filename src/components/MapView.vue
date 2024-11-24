<script setup lang="ts">
  import { ref, onMounted, watch } from "vue";
  import { MapsService } from "../services/MapsService";
  import type { Location } from "../types/maps";

  const props = defineProps<{
    origin?: Location;
    destination?: Location;
  }>();

  const mapContainer = ref<HTMLElement | null>(null);
  const map = ref<google.maps.Map | null>(null);
  const directionsRenderer = ref<google.maps.DirectionsRenderer | null>(null);
  const mapsService = MapsService.getInstance();
  const loading = ref(true);
  const error = ref<string>("");

  onMounted(async () => {
    try {
      loading.value = true;
      await mapsService.initialize();

      if (mapContainer.value) {
        map.value = new google.maps.Map(mapContainer.value, {
          zoom: 12,
          center: { lat: 0, lng: 0 },
          mapTypeId: google.maps.MapTypeId.ROADMAP,
          mapTypeControl: true,
          streetViewControl: true,
          fullscreenControl: true,
        });

        directionsRenderer.value = new google.maps.DirectionsRenderer({
          map: map.value,
          suppressMarkers: false,
          preserveViewport: false,
          polylineOptions: {
            strokeColor: "#42b883",
            strokeWeight: 5,
          },
        });
      }
    } catch (err) {
      error.value = "Failed to load map. Please refresh the page.";
      console.error("Failed to initialize map:", err);
    } finally {
      loading.value = false;
    }
  });

  watch(
    [() => props.origin, () => props.destination],
    async ([newOrigin, newDestination], [oldOrigin, oldDestination]) => {
      if (!map.value || !directionsRenderer.value) return;

      try {
        if (
          newOrigin &&
          (!oldOrigin || (oldOrigin !== newOrigin && !newDestination))
        ) {
          map.value.setCenter(newOrigin);
        }

        if (newOrigin && newDestination) {
          loading.value = true;
          await mapsService.ensureInitialized();
          const directions = await mapsService.getDirections(
            newOrigin,
            newDestination
          );

          if (directions) {
            directionsRenderer.value.setMap(map.value);
            directionsRenderer.value.setDirections(directions);

            const bounds = new google.maps.LatLngBounds();
            bounds.extend(new google.maps.LatLng(newOrigin.lat, newOrigin.lng));
            bounds.extend(
              new google.maps.LatLng(newDestination.lat, newDestination.lng)
            );
            map.value.fitBounds(bounds);
          }
        }
      } catch (err) {
        error.value = "Failed to update map route.";
        console.error("Error updating route:", err);
      } finally {
        loading.value = false;
      }
    },
    { immediate: true }
  );
</script>

<template>
  <div class="map-wrapper">
    <div v-if="loading" class="map-overlay">
      <div class="loader">Loading map...</div>
    </div>
    <div v-if="error" class="map-error">{{ error }}</div>
    <div ref="mapContainer" class="map-container"></div>
  </div>
</template>

<style scoped>
  .map-wrapper {
    position: relative;
    width: 100%;
    height: 400px;
    margin-top: 1rem;
  }

  .map-container {
    width: 100%;
    height: 100%;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  .map-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(255, 255, 255, 0.8);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1;
    border-radius: 8px;
  }

  .loader {
    padding: 1rem;
    background: white;
    border-radius: 4px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  .map-error {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: #fff;
    padding: 1rem;
    border-radius: 4px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    color: #dc3545;
    z-index: 2;
  }
</style>
