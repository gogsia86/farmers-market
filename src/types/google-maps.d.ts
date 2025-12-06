/**
 * 🗺️ GOOGLE MAPS TYPE DECLARATIONS
 *
 * Type definitions for Google Maps JavaScript API
 * Provides TypeScript support for map components
 *
 * @module types/google-maps
 * @divine-pattern Type safety consciousness
 */

declare global {
  interface Window {
    google: typeof google;
  }
}

declare namespace google {
  namespace maps {
    class Map {
      constructor(mapDiv: HTMLElement, opts?: MapOptions);
      setCenter(latLng: LatLng | LatLngLiteral): void;
      setZoom(zoom: number): void;
      fitBounds(bounds: LatLngBounds | LatLngBoundsLiteral): void;
      panTo(latLng: LatLng | LatLngLiteral): void;
      getZoom(): number;
      getCenter(): LatLng;
      getBounds(): LatLngBounds | undefined;
    }

    interface MapOptions {
      center?: LatLng | LatLngLiteral;
      zoom?: number;
      mapTypeId?: string;
      disableDefaultUI?: boolean;
      zoomControl?: boolean;
      mapTypeControl?: boolean;
      scaleControl?: boolean;
      streetViewControl?: boolean;
      rotateControl?: boolean;
      fullscreenControl?: boolean;
      gestureHandling?: string;
      styles?: MapTypeStyle[];
    }

    interface MapTypeStyle {
      elementType?: string;
      featureType?: string;
      stylers?: Array<Record<string, any>>;
    }

    class LatLng {
      constructor(lat: number, lng: number);
      lat(): number;
      lng(): number;
      equals(other: LatLng): boolean;
      toString(): string;
      toJSON(): LatLngLiteral;
    }

    interface LatLngLiteral {
      lat: number;
      lng: number;
    }

    class LatLngBounds {
      constructor(sw?: LatLng | LatLngLiteral, ne?: LatLng | LatLngLiteral);
      contains(latLng: LatLng | LatLngLiteral): boolean;
      extend(point: LatLng | LatLngLiteral): LatLngBounds;
      getCenter(): LatLng;
      getNorthEast(): LatLng;
      getSouthWest(): LatLng;
      isEmpty(): boolean;
      toJSON(): LatLngBoundsLiteral;
    }

    interface LatLngBoundsLiteral {
      east: number;
      north: number;
      south: number;
      west: number;
    }

    class Marker {
      constructor(opts?: MarkerOptions);
      setMap(map: Map | null): void;
      setPosition(latLng: LatLng | LatLngLiteral): void;
      setTitle(title: string): void;
      setIcon(icon: string | Icon | Symbol): void;
      setAnimation(animation: Animation | null): void;
      getPosition(): LatLng | undefined;
      getMap(): Map | null;
      addListener(eventName: string, handler: Function): MapsEventListener;
    }

    interface MarkerOptions {
      position?: LatLng | LatLngLiteral;
      map?: Map;
      title?: string;
      icon?: string | Icon | Symbol;
      label?: string | MarkerLabel;
      animation?: Animation;
      clickable?: boolean;
      draggable?: boolean;
      visible?: boolean;
      zIndex?: number;
    }

    interface MarkerLabel {
      text: string;
      color?: string;
      fontSize?: string;
      fontWeight?: string;
    }

    interface Icon {
      url: string;
      size?: Size;
      scaledSize?: Size;
      origin?: Point;
      anchor?: Point;
    }

    interface Symbol {
      path: string | SymbolPath;
      fillColor?: string;
      fillOpacity?: number;
      strokeColor?: string;
      strokeOpacity?: number;
      strokeWeight?: number;
      scale?: number;
      anchor?: Point;
      rotation?: number;
    }

    enum SymbolPath {
      CIRCLE = 0,
      FORWARD_CLOSED_ARROW = 1,
      FORWARD_OPEN_ARROW = 2,
      BACKWARD_CLOSED_ARROW = 3,
      BACKWARD_OPEN_ARROW = 4,
    }

    enum Animation {
      BOUNCE = 1,
      DROP = 2,
    }

    class InfoWindow {
      constructor(opts?: InfoWindowOptions);
      close(): void;
      getContent(): string | Element | null;
      getPosition(): LatLng | undefined;
      open(map?: Map, anchor?: Marker): void;
      setContent(content: string | Element): void;
      setPosition(position: LatLng | LatLngLiteral): void;
    }

    interface InfoWindowOptions {
      content?: string | Element;
      position?: LatLng | LatLngLiteral;
      maxWidth?: number;
      pixelOffset?: Size;
      disableAutoPan?: boolean;
    }

    class Circle {
      constructor(opts?: CircleOptions);
      getCenter(): LatLng;
      getRadius(): number;
      setCenter(center: LatLng | LatLngLiteral): void;
      setRadius(radius: number): void;
      setMap(map: Map | null): void;
      getBounds(): LatLngBounds;
    }

    interface CircleOptions {
      center?: LatLng | LatLngLiteral;
      radius?: number;
      map?: Map;
      strokeColor?: string;
      strokeOpacity?: number;
      strokeWeight?: number;
      fillColor?: string;
      fillOpacity?: number;
      clickable?: boolean;
      draggable?: boolean;
      editable?: boolean;
      visible?: boolean;
      zIndex?: number;
    }

    class Size {
      constructor(
        width: number,
        height: number,
        widthUnit?: string,
        heightUnit?: string,
      );
      width: number;
      height: number;
      equals(other: Size): boolean;
    }

    class Point {
      constructor(x: number, y: number);
      x: number;
      y: number;
      equals(other: Point): boolean;
    }

    class Geocoder {
      constructor();
      geocode(
        request: GeocoderRequest,
        callback: (
          results: GeocoderResult[] | null,
          status: GeocoderStatus,
        ) => void,
      ): void;
    }

    interface GeocoderRequest {
      address?: string;
      location?: LatLng | LatLngLiteral;
      placeId?: string;
      bounds?: LatLngBounds | LatLngBoundsLiteral;
      componentRestrictions?: GeocoderComponentRestrictions;
      region?: string;
    }

    interface GeocoderComponentRestrictions {
      administrativeArea?: string;
      country?: string | string[];
      locality?: string;
      postalCode?: string;
      route?: string;
    }

    interface GeocoderResult {
      address_components: GeocoderAddressComponent[];
      formatted_address: string;
      geometry: GeocoderGeometry;
      place_id: string;
      types: string[];
      partial_match?: boolean;
    }

    interface GeocoderAddressComponent {
      long_name: string;
      short_name: string;
      types: string[];
    }

    interface GeocoderGeometry {
      location: LatLng;
      location_type: GeocoderLocationType;
      viewport: LatLngBounds;
      bounds?: LatLngBounds;
    }

    enum GeocoderStatus {
      ERROR = "ERROR",
      INVALID_REQUEST = "INVALID_REQUEST",
      OK = "OK",
      OVER_QUERY_LIMIT = "OVER_QUERY_LIMIT",
      REQUEST_DENIED = "REQUEST_DENIED",
      UNKNOWN_ERROR = "UNKNOWN_ERROR",
      ZERO_RESULTS = "ZERO_RESULTS",
    }

    enum GeocoderLocationType {
      APPROXIMATE = "APPROXIMATE",
      GEOMETRIC_CENTER = "GEOMETRIC_CENTER",
      RANGE_INTERPOLATED = "RANGE_INTERPOLATED",
      ROOFTOP = "ROOFTOP",
    }

    interface MapsEventListener {
      remove(): void;
    }

    namespace event {
      function addListener(
        instance: any,
        eventName: string,
        handler: Function,
      ): MapsEventListener;
      function removeListener(listener: MapsEventListener): void;
      function clearInstanceListeners(instance: any): void;
      function trigger(instance: any, eventName: string, ...args: any[]): void;
    }
  }
}

export {};
