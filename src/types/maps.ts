export interface Location {
  lat: number;
  lng: number;
}

export interface DistanceCalculatorState {
  distance: string;
  error: string;
  loading: boolean;
}

export interface GeocodingResult {
  geometry: {
    location: google.maps.LatLng;
  };
}

export interface JourneyState {
  isActive: boolean;
  startTime?: Date;
  endTime?: Date;
  totalDistance: number;
  currentLocation?: Location;
}