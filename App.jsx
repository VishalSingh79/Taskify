import React, { useEffect, useState } from 'react';
import { Platform, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Entypo from 'react-native-vector-icons/Entypo';
import EvilIcons from 'react-native-vector-icons/EvilIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Tasks from './src/Screens/Tasks';
import RecyleBin from './src/Screens/RecyleBin';
const Tab = createBottomTabNavigator();

const App = () => {
  const [data, setData] = useState([]);

  const getData = async () => {
    try {
      const storedData = await AsyncStorage.getItem('data');
      if (storedData !== null) {
        setData(JSON.parse(storedData));
      }
    } catch (error) {
      console.error('❌ Data Fetch Error:', error);
    }
  };

  useEffect(() => {
    getData();
  }, []);

  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          tabBarActiveTintColor: '#003366',
          tabBarLabelStyle: { fontSize: 14 },
          tabBarStyle: { height: 60 },
          headerStyle: { backgroundColor: '#003366' },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
            fontSize: 24,
            letterSpacing: 0.4,
          },
        }}
      >
        <Tab.Screen
          name="Tasks"
          options={{
            title: 'All Tasks',
            tabBarIcon: ({ color, size }) => (
              <Entypo name="home" size={size} color={color} />
            ),
          }}
        >
          {() => <Tasks data={data} setData={setData} />}
        </Tab.Screen>

        <Tab.Screen
          name="RecycleBin"
          options={{
            title: 'Recycle Bin',
            tabBarIcon: ({ color, size }) => (
              <EvilIcons name="trash" size={30} color={color} />
            ),
          }}
        >
          {() => <RecyleBin data={data} setData={setData} />}
        </Tab.Screen>
      </Tab.Navigator>
    </NavigationContainer>
  );
};

export default App;

const styles = StyleSheet.create({});
