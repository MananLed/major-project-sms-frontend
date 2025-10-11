import { definePreset } from '@primeuix/themes';
import Aura from '@primeuix/themes/aura';

export const customPreset = definePreset(Aura, {
  semantic: {
    primary: {
      50: '{sky.50}',
      100: '{sky.100}',
      200: '{sky.200}',
      300: '{sky.300}',
      400: '{sky.400}',
      500: '{sky.500}',
      600: '{sky.600}',
      700: '{sky.700}',
      800: '{sky.800}',
      900: '{sky.900}',
      950: '{sky.950}',
    },
    colorScheme: {
      light: {
        primary: {
          color: '{sky.800}',
          inverseColor: '#ffffff',
          hoverColor: '{sky.900}',
          activeColor: '{sky.800}',
        },
        highlight: {
          background: '{sky.950}',
          focusBackground: '{sky.700}',
          color: '#ffffff',
          focusColor: '#ffffff',
        },
      },
      dark: {
        primary: {
          color: '{sky.50}',
          hoverColor: '{sky.100}',
          activeColor: '{sky.200}',
        },
        highlight: {
          background: 'rgba(19, 17, 17, 0.16)',
          focusBackground: 'rgba(250, 250, 250, .24)',
          color: 'rgba(255,255,255,.87)',
          focusColor: 'rgba(255,255,255,.87)',
        },
      },
    },
  },
});
