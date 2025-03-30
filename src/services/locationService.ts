
import { supabase } from "@/integrations/supabase/client";

export interface GeocodeResult {
  isValid: boolean;
  formattedAddress?: string;
  components?: {
    street?: string;
    city?: string;
    state?: string;
    country?: string;
    postalCode?: string;
  };
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export const validateAddress = async (address: string): Promise<GeocodeResult> => {
  try {
    // Call our edge function to validate the address
    const { data, error } = await supabase.functions.invoke("get-location", {
      body: { address },
    });

    if (error || !data) {
      console.error("Error validating address:", error);
      return { isValid: false };
    }

    return {
      isValid: !!data.formattedAddress,
      formattedAddress: data.formattedAddress,
      components: data.components,
      coordinates: data.coordinates,
    };
  } catch (error) {
    console.error("Error in validateAddress:", error);
    return { isValid: false };
  }
};

export const reverseGeocode = async (lat: number, lng: number): Promise<GeocodeResult> => {
  try {
    // Call our edge function to get location from coordinates
    const { data, error } = await supabase.functions.invoke("get-location", {
      body: { lat, lng },
    });

    if (error || !data) {
      console.error("Error reverse geocoding:", error);
      return { isValid: false };
    }

    return {
      isValid: true,
      formattedAddress: data.formattedAddress,
      components: data.components,
      coordinates: { lat, lng },
    };
  } catch (error) {
    console.error("Error in reverseGeocode:", error);
    return { isValid: false };
  }
};

export const getCurrentLocation = (): Promise<GeolocationPosition> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation is not supported by your browser"));
      return;
    }
    
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true,
      timeout: 5000,
      maximumAge: 0
    });
  });
};
