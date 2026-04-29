/**
 * Image sources — Platform-aware.
 *
 * On native:  require() returns a numeric asset ID bundled by Metro.
 * On web:     require() inside lambdas is not detected by Metro's static analyser,
 *             so we use URI strings served from public/images/ (web root).
 */
import { Platform } from 'react-native';
import type { ImageSourcePropType } from 'react-native';

function webImg(filename: string): ImageSourcePropType {
  return { uri: `/images/${filename}` };
}

export const Images: {
  logo:           ImageSourcePropType;
  logoFlux:       ImageSourcePropType;
  featureGraphic: ImageSourcePropType;
  heroToday:      ImageSourcePropType;
  heroPaywall:    ImageSourcePropType;
  emptyState:     ImageSourcePropType;
  splash:         ImageSourcePropType;
  catPolitics:    ImageSourcePropType;
  catCrypto:      ImageSourcePropType;
  catSports:      ImageSourcePropType;
  catTech:        ImageSourcePropType;
  catEconomics:   ImageSourcePropType;
  catScience:     ImageSourcePropType;
  catWorld:       ImageSourcePropType;
} = Platform.OS === 'web'
  ? {
      logo:           webImg('logo.png'),
      logoFlux:       webImg('logo-flux.png'),
      featureGraphic: webImg('feature-graphic.png'),
      heroToday:      webImg('hero-today.png'),
      heroPaywall:    webImg('hero-paywall.png'),
      emptyState:     webImg('empty-state.png'),
      splash:         webImg('splash.png'),
      catPolitics:    webImg('cat-politics.png'),
      catCrypto:      webImg('cat-crypto.png'),
      catSports:      webImg('cat-sports.png'),
      catTech:        webImg('cat-tech.png'),
      catEconomics:   webImg('cat-economics.png'),
      catScience:     webImg('cat-science.png'),
      catWorld:       webImg('cat-world.png'),
    }
  : {
      logo:           require('../assets/images/logo.png'),
      logoFlux:       require('../assets/images/logo-flux.png'),
      featureGraphic: require('../assets/images/feature-graphic.png'),
      heroToday:      require('../assets/images/hero-today.png'),
      heroPaywall:    require('../assets/images/hero-paywall.png'),
      emptyState:     require('../assets/images/empty-state.png'),
      splash:         require('../assets/images/splash.png'),
      catPolitics:    require('../assets/images/cat-politics.png'),
      catCrypto:      require('../assets/images/cat-crypto.png'),
      catSports:      require('../assets/images/cat-sports.png'),
      catTech:        require('../assets/images/cat-tech.png'),
      catEconomics:   require('../assets/images/cat-economics.png'),
      catScience:     require('../assets/images/cat-science.png'),
      catWorld:       require('../assets/images/cat-world.png'),
    };

/** Maps a category string to its image source, or null if no image available. */
export function getCategoryImage(category: string): ImageSourcePropType | null {
  const map: Record<string, ImageSourcePropType> = {
    Politics:   Images.catPolitics,
    Crypto:     Images.catCrypto,
    Sports:     Images.catSports,
    Technology: Images.catTech,
    Tech:       Images.catTech,
    Economics:  Images.catEconomics,
    Science:    Images.catScience,
    World:      Images.catWorld,
    politics:   Images.catPolitics,
    crypto:     Images.catCrypto,
    sports:     Images.catSports,
    technology: Images.catTech,
    tech:       Images.catTech,
    economics:  Images.catEconomics,
    science:    Images.catScience,
    world:      Images.catWorld,
  };
  return map[category] ?? null;
}
