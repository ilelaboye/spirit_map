import { Loader } from "@googlemaps/js-api-loader";
import type { Location } from "../types/maps";

const GOOGLE_MAPS_API_KEY = "AIzaSyACiXEXHit8rm2r08OS79ztwhZDtEqvGGM"; // Replace with your actual API key

export class MapsService {
  private static instance: MapsService;
  private geocoder?: google.maps.Geocoder;
  private directionsService?: google.maps.DirectionsService;
  private loader: Loader;
  private initialized: boolean = false;
  private initializationPromise?: Promise<void>;
  private retryCount: number = 0;
  private maxRetries: number = 3;
  private retryDelay: number = 1000;

  private constructor() {
    this.loader = new Loader({
      apiKey: GOOGLE_MAPS_API_KEY,
      version: "weekly",
      libraries: ["places", "geometry", "directions"],
      retries: 3,
      language: "en",
      region: "US",
    });
  }

  public static getInstance(): MapsService {
    if (!MapsService.instance) {
      MapsService.instance = new MapsService();
    }
    return MapsService.instance;
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private async retryInitialization(): Promise<void> {
    this.retryCount++;
    const delayMs = this.retryDelay * Math.pow(2, this.retryCount - 1);
    console.log(
      `Retrying Maps initialization in ${delayMs}ms (attempt ${this.retryCount}/${this.maxRetries})`
    );
    await this.delay(delayMs);
    return this.initializeInternal();
  }

  public async initialize(): Promise<void> {
    if (!this.initializationPromise) {
      this.initializationPromise = this.initializeInternal();
    }
    return this.initializationPromise;
  }

  private async initializeInternal(): Promise<void> {
    if (this.initialized) return;

    try {
      await this.loader.load();
      this.geocoder = new google.maps.Geocoder();
      this.directionsService = new google.maps.DirectionsService();
      this.initialized = true;
      this.retryCount = 0;
    } catch (error) {
      this.initialized = false;
      this.initializationPromise = undefined;

      if (this.retryCount < this.maxRetries) {
        return this.retryInitialization();
      }

      throw new Error(
        "Failed to initialize Google Maps after multiple attempts"
      );
    }
  }

  public async ensureInitialized(): Promise<void> {
    if (!this.initialized) {
      await this.initialize();
    }
  }

  public async geocodeAddress(
    address: string
  ): Promise<google.maps.LatLng | null> {
    await this.ensureInitialized();

    if (!this.geocoder) {
      throw new Error("Maps service not initialized");
    }

    try {
      const response = await this.geocoder.geocode({ address });
      if (response.results.length === 0) {
        throw new Error("Location not found");
      }
      return response.results[0].geometry.location;
    } catch (error) {
      console.error("Geocoding error:", error);
      throw error;
    }
  }

  public calculateDistance(origin: Location, destination: Location): number {
    const originLatLng = new google.maps.LatLng(origin.lat, origin.lng);
    const destinationLatLng = new google.maps.LatLng(
      destination.lat,
      destination.lng
    );

    return google.maps.geometry.spherical.computeDistanceBetween(
      originLatLng,
      destinationLatLng
    );
  }

  public async getDirections(
    origin: Location,
    destination: Location
  ): Promise<google.maps.DirectionsResult> {
    await this.ensureInitialized();

    if (!this.directionsService) {
      throw new Error("Directions service not initialized");
    }

    const request: google.maps.DirectionsRequest = {
      origin: new google.maps.LatLng(origin.lat, origin.lng),
      destination: new google.maps.LatLng(destination.lat, destination.lng),
      travelMode: google.maps.TravelMode.DRIVING,
      optimizeWaypoints: true,
    };

    return new Promise((resolve, reject) => {
      this.directionsService!.route(request, (result, status) => {
        if (status === google.maps.DirectionsStatus.OK && result) {
          resolve(result);
        } else {
          reject(new Error(`Failed to get directions: ${status}`));
        }
      });
    });
  }
}
