/**
 * Helper functions to load individual JSON files
 * Instead of loading huge metadata files, load only what's needed
 */

/**
 * Load a single machine by ID
 */
export async function loadMachine(machineId: string): Promise<any | null> {
  try {
    const machineData = await import(`../../public/machines/${machineId}.json`);
    return machineData.default || machineData;
  } catch (error) {
    console.warn(`Machine ${machineId} not found`);
    return null;
  }
}

/**
 * Load a single rule by ID
 */
export async function loadRule(ruleId: string): Promise<any | null> {
  try {
    const ruleData = await import(`../../public/rules/${ruleId}.json`);
    return ruleData.default || ruleData;
  } catch (error) {
    console.warn(`Rule ${ruleId} not found`);
    return null;
  }
}

/**
 * Load a single feature by ID
 */
export async function loadFeature(featureId: string): Promise<any | null> {
  try {
    const featureData = await import(`../../public/features/${featureId}.json`);
    return featureData.default || featureData;
  } catch (error) {
    console.warn(`Feature ${featureId} not found`);
    return null;
  }
}

/**
 * Load the index file for quick lookup
 */
export async function loadMachinesIndex(): Promise<any | null> {
  try {
    const index = await import('../../public/machines-index.json');
    return index.default || index;
  } catch (error) {
    return null;
  }
}

export async function loadRulesIndex(): Promise<any | null> {
  try {
    const index = await import('../../public/rules-index.json');
    return index.default || index;
  } catch (error) {
    return null;
  }
}

export async function loadFeaturesIndex(): Promise<any | null> {
  try {
    const index = await import('../../public/features-index.json');
    return index.default || index;
  } catch (error) {
    return null;
  }
}

