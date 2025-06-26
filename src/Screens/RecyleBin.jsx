import {
  StyleSheet,
  Text,
  View,
  FlatList,
  Pressable,
  Alert,
  ScrollView,
} from 'react-native';
import React from 'react';
import EvilIcons from 'react-native-vector-icons/EvilIcons';
import Entypo from 'react-native-vector-icons/Entypo';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect } from 'react';

const RecyleBin = ({ data, setData }) => {
  const deletedItems = data.filter(item => item.isDelete);

  const saveToStorage = async updatedData => {
    try {
      await AsyncStorage.setItem('data', JSON.stringify(updatedData));
    } catch (error) {
      console.log('Storage Error:', error);
    }
  };

  const handleRestore = id => {
    const updatedData = data.map(item =>
      item.id === id ? { ...item, isDelete: false } : item,
    );
    setData(updatedData);
    saveToStorage(updatedData);
    Alert.alert('Task Restored');
  };

  const handlePermanentDelete = id => {
    const updatedData = data.filter(item => item.id !== id);
    setData(updatedData);
    saveToStorage(updatedData);
    Alert.alert('Task Permanently Deleted');
  };

  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const sevenDays = 7 * 24 * 60 * 60 * 1000;;

      const filteredData = data.filter(item => {
        if (item.isDelete && item.deletedAt) {
          return now - item.deletedAt < sevenDays;
        }
        return true;
      });

      if (filteredData.length !== data.length) {
        setData(filteredData);
        saveToStorage(filteredData);
      }
    }, 10000); 

    return () => clearInterval(interval); 
  }, [data]);

  return (
    <View style={styles.container}>
      {deletedItems.length === 0 ? (
        <Text style={styles.emptyText}>No deleted tasks.</Text>
      ) : (
        <FlatList
          data={deletedItems}
          keyExtractor={item => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.taskContainer}>
              <ScrollView horizontal={true} style={{ maxWidth: 150 }}>
                <Text style={styles.taskText}>{item.name}</Text>
              </ScrollView>
              <View style={styles.actions}>
                <Pressable
                  onPress={() => handleRestore(item.id)}
                  style={styles.restoreBtn}
                >
                  <Entypo name="back" size={20} color="white" />
                  <Text style={styles.btnText}>Restore</Text>
                </Pressable>
                <Pressable
                  onPress={() => handlePermanentDelete(item.id)}
                  style={styles.deleteBtn}
                >
                  <EvilIcons name="trash" size={24} color="white" />
                  <Text style={styles.btnText}>Delete</Text>
                </Pressable>
              </View>
            </View>
          )}
        />
      )}
    </View>
  );
};

export default RecyleBin;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E0FFFF',
    padding: 10,
  },
  taskContainer: {
    backgroundColor: '#E0FFFF',
    borderWidth: 1,
    borderColor: '#003366',
    marginVertical: 8,
    padding: 12,
    borderRadius: 10,
    justifyContent: 'space-between',
    flexDirection: 'row',
    alignItems: 'center',
  },
  taskText: {
    fontSize: 16,
    backgroundColor: '#E0FFFF',
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
  },
  restoreBtn: {
    flexDirection: 'row',
    backgroundColor: 'green',
    padding: 6,
    borderRadius: 6,
    alignItems: 'center',
  },
  deleteBtn: {
    flexDirection: 'row',
    backgroundColor: 'red',
    paddingHorizontal: 12,
    paddingVertical: 10.7,
    borderRadius: 6,
    alignItems: 'center',
  },
  btnText: {
    color: 'white',
    marginLeft: 5,
    fontWeight: '600',
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#666',
    marginTop: 20,
  },
});
