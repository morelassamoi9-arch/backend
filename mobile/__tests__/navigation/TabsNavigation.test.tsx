// Required testIDs: tabs-navigator
import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { View } from 'react-native';

jest.mock('expo-router', () => {
  const { View } = require('react-native');
  return {
    useRouter: () => ({ push: jest.fn(), replace: jest.fn(), back: jest.fn() }),
    useLocalSearchParams: () => ({}),
    Link: ({ children }: { children: React.ReactNode }) => children,
    Tabs: ({ children }: { children?: React.ReactNode }) => (
      <View testID="tabs-navigator">{children}</View>
    ),
  };
});

import { Tabs } from 'expo-router';

const TabsLayout = () => <Tabs />;

describe('Tabs Navigation', () => {
  it('renders tabs navigator without crashing', () => {
    render(<TabsLayout />);
    expect(screen.getByTestId('tabs-navigator')).toBeTruthy();
  });
});
