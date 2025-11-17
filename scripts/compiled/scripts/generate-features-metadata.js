#!/usr/bin/env ts-node
"use strict";
/**
 * Generate features metadata from Gherkin feature files
 * Creates a JSON file with all feature information for the documentation site
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
const feature_parser_1 = require("../docs-astro/src/lib/feature-parser");
/**
 * Calculate statistics from features
 */
function calculateStatistics(features) {
    const totalScenarios = features.reduce((sum, f) => sum + f.scenarios.length, 0);
    const totalSteps = features.reduce((sum, f) => sum + f.scenarios.reduce((s, sc) => s + sc.steps.length, 0), 0);
    const totalExamples = features.reduce((sum, f) => sum + f.scenarios.reduce((s, sc) => {
        if (!sc.examples)
            return s;
        return s + sc.examples.reduce((ex, table) => ex + table.rows.length, 0);
    }, 0), 0);
    // Calculate tags distribution
    const tagsDistribution = {};
    features.forEach(feature => {
        // Count feature tags
        feature.tags.forEach(tag => {
            tagsDistribution[tag] = (tagsDistribution[tag] || 0) + 1;
        });
        // Count scenario tags
        feature.scenarios.forEach(scenario => {
            scenario.tags.forEach(tag => {
                tagsDistribution[tag] = (tagsDistribution[tag] || 0) + 1;
            });
        });
    });
    return {
        totalScenarios,
        totalSteps,
        averageScenariosPerFeature: features.length > 0
            ? (totalScenarios / features.length).toFixed(1)
            : '0',
        averageStepsPerScenario: totalScenarios > 0
            ? (totalSteps / totalScenarios).toFixed(1)
            : '0',
        totalExamples,
        tagsDistribution
    };
}
/**
 * Extract unique categories from features
 */
function extractCategories(features) {
    const categories = new Set();
    features.forEach(f => categories.add(f.category));
    return Array.from(categories).sort();
}
/**
 * Extract unique languages from features
 */
function extractLanguages(features) {
    const languages = new Set();
    features.forEach(f => languages.add(f.language));
    return Array.from(languages).sort();
}
/**
 * Pretty print category names
 */
function prettifyCategory(category) {
    const categoryNames = {
        'benefits': 'Prestations Sociales',
        'conversion': 'Conversion de Textes',
        'tax': 'Fiscalité',
        'droits-civils': 'Droits Civils',
        'etrangers': 'Droit des Étrangers',
        'recours-etat': 'Recours État',
        'employment': 'Emploi',
        'health': 'Santé',
        'education': 'Éducation',
        'housing': 'Logement'
    };
    return categoryNames[category] || category
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}
/**
 * Main execution function
 */
async function main() {
    console.log('🚀 Génération des métadonnées des features Gherkin...\n');
    // Define paths
    const featuresDir = path.join(__dirname, '..', 'features');
    const outputPath = path.join(__dirname, '..', 'docs-astro', 'public', 'features-metadata.json');
    // Find all feature files
    console.log(`📂 Recherche de fichiers .feature dans ${featuresDir}...`);
    const featureFiles = (0, feature_parser_1.findFeatureFiles)(featuresDir);
    console.log(`📊 Trouvé ${featureFiles.length} fichiers feature\n`);
    // Parse all features
    console.log('🔍 Parsing des features...');
    const features = (0, feature_parser_1.parseMultipleFeatures)(featureFiles);
    console.log(`✅ Parsé ${features.length} features avec succès\n`);
    // Sort features by category then by name
    features.sort((a, b) => {
        if (a.category !== b.category) {
            return a.category.localeCompare(b.category);
        }
        return a.name.localeCompare(b.name);
    });
    // Extract categories and languages
    const categories = extractCategories(features);
    const languages = extractLanguages(features);
    // Calculate statistics
    const statistics = calculateStatistics(features);
    // Print summary by category
    console.log('📁 Résumé par catégorie:');
    categories.forEach(category => {
        const categoryFeatures = features.filter(f => f.category === category);
        const categoryScenarios = categoryFeatures.reduce((sum, f) => sum + f.scenarios.length, 0);
        console.log(`  • ${prettifyCategory(category)}: ${categoryFeatures.length} features, ${categoryScenarios} scénarios`);
    });
    console.log('\n📊 Statistiques globales:');
    console.log(`  • Total features: ${features.length}`);
    console.log(`  • Total scénarios: ${statistics.totalScenarios}`);
    console.log(`  • Total étapes: ${statistics.totalSteps}`);
    console.log(`  • Total exemples: ${statistics.totalExamples}`);
    console.log(`  • Moyenne scénarios/feature: ${statistics.averageScenariosPerFeature}`);
    console.log(`  • Moyenne étapes/scénario: ${statistics.averageStepsPerScenario}`);
    // Count features with legal metadata
    const featuresWithLegal = features.filter(f => f.metadata.legalBasis && f.metadata.legalUrl);
    console.log(`  • Features avec référence légale: ${featuresWithLegal.length}/${features.length}`);
    // Show top tags
    const topTags = Object.entries(statistics.tagsDistribution)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10);
    if (topTags.length > 0) {
        console.log('\n🏷️  Top 10 tags:');
        topTags.forEach(([tag, count]) => {
            console.log(`  • ${tag}: ${count} utilisations`);
        });
    }
    // Create metadata object
    const metadata = {
        generated: new Date().toISOString(),
        totalFeatures: features.length,
        categories,
        features,
        statistics,
        languages
    };
    // Write to file
    console.log(`\n📝 Écriture du fichier de métadonnées...`);
    fs.writeFileSync(outputPath, JSON.stringify(metadata, null, 2), 'utf-8');
    const fileSize = (fs.statSync(outputPath).size / 1024).toFixed(2);
    console.log(`✨ Fichier généré: ${outputPath}`);
    console.log(`📦 Taille: ${fileSize} KB`);
    console.log('\n✅ Génération terminée avec succès!');
}
// Execute with error handling
main().catch(error => {
    console.error('❌ Erreur lors de la génération:', error);
    process.exit(1);
});
