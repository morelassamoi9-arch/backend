import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from "@expo-google-fonts/inter";

import {
  Lora_400Regular,
  Lora_500Medium,
  Lora_600SemiBold,
  Lora_700Bold,
} from "@expo-google-fonts/lora";

// Font map passed to useFonts() in _layout.tsx
export const FontMap = {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  Lora_400Regular,
  Lora_500Medium,
  Lora_600SemiBold,
  Lora_700Bold,
};

// Semantic aliases used in styles throughout the app
export const Fonts = {
  regular: "Inter_400Regular",
  medium: "Inter_500Medium",
  semiBold: "Inter_600SemiBold",
  bold: "Inter_700Bold",
  serifRegular: "Lora_400Regular",
  serifMedium: "Lora_500Medium",
  serifSemiBold: "Lora_600SemiBold",
  serifBold: "Lora_700Bold",
} as const;

export type FontWeight = keyof typeof Fonts;
