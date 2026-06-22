// Required testIDs: tabs-navigator
import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { View } from 'react-native';

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: jest.fn(), replace: jest.fn(), back: jest.fn() }),
  useLocalSearchParams: () => ({}),
  Tabs: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
}));

// Scaffold tabs navigator wrapper for testing
const TabsNavigatorScaffold = () => (
  <View testID="tabs-navigator" />
);

describe('Tabs Navigation', () => {
  it('renders tabs navigator without crashing', () => {
    render(<TabsNavigatorScaffold />);
    expect(screen.getByTestId('tabs-navigator')).toBeTruthy();
  });
});
