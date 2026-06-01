import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { isAuthenticated } from '../services/auth';
import { colors } from '../theme';
import { Lesson, Branch } from '../types';
import LoginScreen from '../screens/LoginScreen';
import DashboardScreen from '../screens/DashboardScreen';
import BranchScreen from '../screens/BranchScreen';
import PDFViewerScreen from '../screens/PDFViewerScreen';

type RootStackParamList = {
  Login: undefined;
  Dashboard: undefined;
  Branch: { branch: Branch };
  PDFViewer: { lesson: Lesson };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    isAuthenticated().then(setAuthenticated);
  }, []);

  if (authenticated === null) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.bg },
          animation: 'slide_from_left',
        }}
      >
        {!authenticated ? (
          <Stack.Screen name="Login">
            {() => <LoginScreen onLogin={() => setAuthenticated(true)} />}
          </Stack.Screen>
        ) : (
          <>
            <Stack.Screen name="Dashboard">
              {({ navigation }) => (
                <DashboardScreen
                  onSelectBranch={(branch) =>
                    navigation.navigate('Branch', { branch })
                  }
                />
              )}
            </Stack.Screen>
            <Stack.Screen name="Branch">
              {({ navigation, route }) => (
                <BranchScreen
                  branch={route.params.branch}
                  onSelectLesson={(lesson) =>
                    navigation.navigate('PDFViewer', { lesson })
                  }
                  onBack={() => navigation.goBack()}
                />
              )}
            </Stack.Screen>
            <Stack.Screen name="PDFViewer">
              {({ navigation, route }) => (
                <PDFViewerScreen
                  lesson={route.params.lesson}
                  onBack={() => navigation.goBack()}
                />
              )}
            </Stack.Screen>
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.bg,
  },
});
