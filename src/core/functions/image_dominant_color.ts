/*
・ iHorizon Discord Bot (https://github.com/ihrz/ihrz)

・ Licensed under the Attribution-NonCommercial-ShareAlike 4.0 International (CC BY-NC-SA 4.0)

    ・   Under the following terms:

        ・ Attribution — You must give appropriate credit, provide a link to the license, and indicate if changes were made. You may do so in any reasonable manner, but not in any way that suggests the licensor endorses you or your use.

        ・ NonCommercial — You may not use the material for commercial purposes.

        ・ ShareAlike — If you remix, transform, or build upon the material, you must distribute your contributions under the same license as the original.

        ・ No additional restrictions — You may not apply legal terms or technological measures that legally restrict others from doing anything the license permits.


・ Mainly developed by Kisakay (https://github.com/Kisakay)

・ Copyright © 2020-2025 iHorizon
*/

// Disclaimer: Most of these codes lines are generated by an LLM (Claude) model. The code are refactored and modified to fit the project's codebase.

import sharp from 'sharp';

interface RGB {
    r: number;
    g: number;
    b: number;
}

interface HSL {
    h: number;  // Hue (0-360)
    s: number;  // Saturation (0-100)
    l: number;  // Lightness (0-100)
}

/**
 * Convertit RGB en HSL
 */
function rgbToHsl(rgb: RGB): HSL {
    const r = rgb.r / 255;
    const g = rgb.g / 255;
    const b = rgb.b / 255;
    
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const diff = max - min;
    
    let h = 0;
    let s = 0;
    const l = (max + min) / 2;

    if (diff !== 0) {
        s = l > 0.5 ? diff / (2 - max - min) : diff / (max + min);
        
        switch (max) {
            case r:
                h = (g - b) / diff + (g < b ? 6 : 0);
                break;
            case g:
                h = (b - r) / diff + 2;
                break;
            case b:
                h = (r - g) / diff + 4;
                break;
        }
        h *= 60;
    }

    return {
        h,
        s: s * 100,
        l: l * 100
    };
}

/**
 * Convertit RGB en Hex
 */
function rgbToHex(rgb: RGB): string {
    const toHex = (n: number): string => {
        const hex = Math.round(n).toString(16);
        return hex.length === 1 ? '0' + hex : hex;
    };
    return `#${toHex(rgb.r)}${toHex(rgb.g)}${toHex(rgb.b)}`;
}

/**
 * Calcule le score de "vivacité" d'une couleur
 * basé sur la saturation et la luminosité
 */
function getVibrancyScore(hsl: HSL): number {
    // Favorise les couleurs saturées avec une luminosité moyenne-élevée
    const saturationWeight = 1.5;
    const lightnessWeight = 1.0;
    const optimalLightness = 60; // Préfère les couleurs ni trop sombres ni trop claires
    
    const lightnessScore = 100 - Math.abs(hsl.l - optimalLightness);
    return (hsl.s * saturationWeight) + (lightnessScore * lightnessWeight);
}

/**
 * Extrait une couleur vive et une couleur sombre dominantes d'une image
 */
export default async function getVibrantAndDarkColors(input: string | Buffer): Promise<string> {
    try {
        // Gestion des différents types d'entrée
        let imageBuffer: Buffer;
        
        if (Buffer.isBuffer(input)) {
            imageBuffer = input;
        } else if (typeof input === 'string' && (input.startsWith('http://') || input.startsWith('https://'))) {
            const response = await fetch(input);
            imageBuffer = Buffer.from(await response.arrayBuffer());
        } else if (typeof input === 'string') {
            imageBuffer = Buffer.from(input);
        } else {
            throw new Error('Type d\'entrée invalide. URL, chemin de fichier ou Buffer attendu');
        }

        const image = sharp(imageBuffer);
        const { width, height } = await image.metadata();
        
        // Redimensionnement si nécessaire
        const maxDimension = 300;
        let resizedImage = image;
        
        if (width && height && (width > maxDimension || height > maxDimension)) {
            resizedImage = image.resize(maxDimension, maxDimension, {
                fit: 'inside',
                withoutEnlargement: true
            });
        }

        const { data } = await resizedImage
            .raw()
            .toBuffer({ resolveWithObject: true });

        // Analyse des couleurs
        const colorMap = new Map<string, { color: RGB; count: number }>();
        
        for (let i = 0; i < data.length; i += 3) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            
            // Simplification des couleurs
            const simplifiedR = Math.round(r / 10) * 10;
            const simplifiedG = Math.round(g / 10) * 10;
            const simplifiedB = Math.round(b / 10) * 10;
            
            const colorKey = `${simplifiedR},${simplifiedG},${simplifiedB}`;
            
            if (colorMap.has(colorKey)) {
                const colorCount = colorMap.get(colorKey)!;
                colorCount.count++;
            } else {
                colorMap.set(colorKey, {
                    color: { r: simplifiedR, g: simplifiedG, b: simplifiedB },
                    count: 1
                });
            }
        }

        // Filtrage et tri des couleurs
        const colors = Array.from(colorMap.entries())
            .filter(([_, value]) => value.count > (data.length / (3 * 100))) // Ignore les couleurs rares
            .map(([_, value]) => ({
                rgb: value.color,
                hsl: rgbToHsl(value.color),
                count: value.count
            }));

        // Sépare les couleurs en vives et sombres
        const vibrantColors = colors
            .filter(color => color.hsl.l > 20 && color.hsl.s > 20)
            .sort((a, b) => getVibrancyScore(b.hsl) - getVibrancyScore(a.hsl));

        const darkColors = colors
            .filter(color => color.hsl.l < 40)
            .sort((a, b) => a.hsl.l - b.hsl.l);

        // Sélectionne les meilleures couleurs
        const vibrantColor = vibrantColors[0]?.rgb || colors[0].rgb;
        const darkColor = darkColors[0]?.rgb || colors[colors.length - 1].rgb;

        return `${rgbToHex(vibrantColor)} ${rgbToHex(darkColor)}`;
    } catch (error) {
        console.error("Erreur lors de l'analyse de l'image:", error);
        throw error;
    }
}