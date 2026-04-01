/**
 * Provider service transformation utilities
 */
import type { Provider } from '../../../shared/types/broker';
import { neuronToA0gi } from '../../../shared/utils/currency';

/**
 * Service object structure from broker
 * Note: Runtime values might be string/number even though types say bigint
 */
export interface BrokerServiceObject {
  provider?: string;
  model?: string;
  name?: string;
  verifiability?: string;
  url?: string;
  inputPrice?: bigint | string | number;
  outputPrice?: bigint | string | number;
  teeSignerAcknowledged?: boolean;
  serviceType?: string; // Added for UI conditional rendering
}

/**
 * Transform a broker service to a Provider object (Chat page version)
 * @param service - Raw service data from broker
 * @returns Transformed Provider object
 */
export function transformBrokerServiceToProvider(service: unknown): Provider {
  // Type assertion for service properties (exactly as in original ChatPage)
  const serviceObj = service as {
    provider?: string;
    model?: string;
    name?: string;
    verifiability?: string;
    url?: string;
    inputPrice?: bigint;
    outputPrice?: bigint;
    teeSignerAcknowledged?: boolean;
    serviceType?: string;
  };
  
  // Type guard to ensure service has the required properties
  const providerAddress = serviceObj.provider || "";
  const modelName = serviceObj.model || "Unknown Model";
  // const modelName = rawModel.includes('/') ? rawModel.split('/').slice(1).join('/') : rawModel;
  const rawProviderName = serviceObj.name || serviceObj.model || "Unknown Provider";
  const providerName = rawProviderName.includes('/') ? rawProviderName.split('/').slice(1).join('/') : rawProviderName;
  const verifiability = serviceObj.verifiability || "TEE";
  const serviceUrl = serviceObj.url || "";

  // Convert prices from neuron to 0G
  // For text-to-image: price is per image, no multiplier needed
  // For chatbot/speech-to-text: price is per token, multiply by 1M to show "per million tokens"
  const isPerImage = serviceObj.serviceType === 'text-to-image' ||
    serviceObj.name?.toLowerCase().includes('image');
  const priceMultiplier = isPerImage ? BigInt(1) : BigInt(1000000);

  // Safely convert inputPrice to BigInt (handle string/number/bigint)
  const toBigInt = (val: bigint | string | number | undefined): bigint | undefined => {
    if (val === undefined) return undefined;
    try { return BigInt(val); } catch { return undefined; }
  };

  const inputPriceBig = toBigInt(serviceObj.inputPrice);
  const outputPriceBig = toBigInt(serviceObj.outputPrice);

  const inputPrice = inputPriceBig !== undefined
    ? neuronToA0gi(inputPriceBig * priceMultiplier)
    : undefined;
  const outputPrice = outputPriceBig !== undefined
    ? neuronToA0gi(outputPriceBig * priceMultiplier)
    : undefined;

  return {
    address: providerAddress,
    model: modelName,
    name: providerName,
    verifiability: verifiability,
    url: serviceUrl,
    inputPrice,
    outputPrice,
    inputPriceNeuron: inputPriceBig,
    outputPriceNeuron: outputPriceBig,
    teeSignerAcknowledged: serviceObj.teeSignerAcknowledged ?? false,
    serviceType: serviceObj.serviceType, // Pass through for UI conditional rendering
  };
}

/**
 * Transform an array of broker services to Provider objects
 * @param services - Array of raw service data from broker
 * @returns Array of transformed Provider objects
 */
export function transformBrokerServicesToProviders(services: unknown[]): Provider[] {
  return services.map(transformBrokerServiceToProvider);
}
