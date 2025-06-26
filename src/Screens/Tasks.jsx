import {
  StyleSheet,
  Text,
  View,
  TextInput,
  Pressable,
  FlatList,
  Alert,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import React, { useState, useEffect } from 'react';
import EvilIcons from 'react-native-vector-icons/EvilIcons';
import CheckBox from '@react-native-community/checkbox';
import Entypo from 'react-native-vector-icons/Entypo';
import AsyncStorage from '@react-native-async-storage/async-storage';
import notifee, {
  TriggerType,
  AndroidImportance,
} from '@notifee/react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import Ionicons from 'react-native-vector-icons/Ionicons';

const Tasks = ({ data, setData }) => {
  const [addData, setaddData] = useState('');
  const [isEditable, setisEditable] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [showPicker, setShowPicker] = useState(false);

  const saveToStorage = async updatedData => {
    try {
      await AsyncStorage.setItem('data', JSON.stringify(updatedData));
    } catch (error) {
      console.log('Storage Error:', error);
    }
  };

  const handleToggle = id => {
    const updatedData = data.map(item =>
      item.id === id ? { ...item, isDone: !item.isDone } : item,
    );
    setData(updatedData);
    saveToStorage(updatedData);
  };

  const handleDelete = id => {
    const updatedData = data.map(item =>
      item.id === id
        ? { ...item, isDelete: true, deletedAt: Date.now() }
        : item,
    );
    setData(updatedData);
    saveToStorage(updatedData);
    Alert.alert('Task Deleted', 'It will be removed after 7 days.');
  };

  const handleEdit = id => {
    const taskToEdit = data.find(item => item.id === id);
    if (taskToEdit) {
      setaddData(taskToEdit.name);
      setisEditable(true);
      setEditingId(id);
      setSelectedDate(taskToEdit.scheduledAt || null);
    }
  };

  const handleAdd = async () => {
    if (addData.trim() === '') return;

    if (isEditable && editingId !== null) {
      const updatedData = data.map(item =>
        item.id === editingId
          ? { ...item, name: addData, scheduledAt: selectedDate || null }
          : item,
      );
      setData(updatedData);
      saveToStorage(updatedData);

      if (selectedDate) {
        await createNotification(addData, selectedDate);
      }

      setisEditable(false);
      setEditingId(null);
      setaddData('');
      setSelectedDate(null);
      Alert.alert('Task Updated');
    } else {
      const newTask = {
        id: Date.now(),
        name: addData,
        isDone: false,
        isDelete: false,
        scheduledAt: selectedDate || null,
      };

      const updatedData = [newTask, ...data];
      setData(updatedData);
      saveToStorage(updatedData);

      if (selectedDate) {
        await createNotification(addData, selectedDate);
      }

      setaddData('');
      setSelectedDate(null);
      Alert.alert('Task Added');
    }
  };

  const createNotification = async (taskName, fireDate) => {
    const trigger = {
      type: TriggerType.TIMESTAMP,
      timestamp: fireDate.getTime(),
    };

    await notifee.createTriggerNotification(
      {
        title: 'ToDo Task Reminder',
        body: taskName,
        android: {
          channelId: 'default',
          sound: 'default',
        },
      },
      trigger,
    );
  };

  const handleConfirm = date => {
    setSelectedDate(date);
    setShowPicker(false);
    Alert.alert('Schedule Selected', `At ${date.toLocaleString()}`);
  };

  useEffect(() => {
    async function createChannel() {
      await notifee.createChannel({
        id: 'default',
        name: 'Default Channel',
        importance: AndroidImportance.HIGH,
      });
    }
    createChannel();
  }, []);

  return (
    <View style={styles.container}>
      <View>
        <View style={styles.searchContainer}>
          <TextInput
            placeholder="Add Task.."
            placeholderTextColor="#888"
            style={styles.addText}
            value={addData}
            onChangeText={setaddData}
            onSubmitEditing={handleAdd}
            returnKeyType="done"
          />
          <TouchableOpacity
            style={styles.scheduleIcon}
            disabled={addData.trim() === ''}
            onPress={() => setShowPicker(true)}
          >
            <Ionicons
              name="time-outline"
              size={24}
              color={addData.trim() === '' ? 'gray' : '#003366'}
            />
          </TouchableOpacity>
          <Pressable style={styles.addIcon} onPress={handleAdd}>
            <Text style={{ color: 'white', fontWeight: 'bold' }}>
              {isEditable ? 'Update' : 'Add Todo'}
            </Text>
          </Pressable>
        </View>

        <FlatList
          data={data}
          renderItem={({ item }) => {
            if (item.isDelete) return null;
            return (
              <View style={styles.taskContainer}>
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <CheckBox
                      value={item.isDone}
                      tintColors={{ true: '#003366', false: 'black' }}
                      onValueChange={() => handleToggle(item.id)}
                      style={{ transform: [{ scaleX: 0.9 }, { scaleY: 0.9 }] }}
                    />
                    <ScrollView horizontal style={{ maxWidth: 240 }}>
                      <Text
                        style={[
                          styles.taskText,
                          {
                            textDecorationLine: item.isDone
                              ? 'line-through'
                              : 'none',
                          },
                        ]}
                      >
                        {item.name}
                      </Text>
                    </ScrollView>
                  </View>
                  {item.scheduledAt && (
                    <Text style={styles.scheduleText}>
                      Scheduled: {new Date(item.scheduledAt).toLocaleString()}
                    </Text>
                  )}
                </View>

                <View style={styles.actionButtons}>
                  <EvilIcons
                    name="trash"
                    size={30}
                    style={styles.deleteIcon}
                    onPress={() => handleDelete(item.id)}
                  />
                  <Entypo
                    name="edit"
                    size={20}
                    color="white"
                    style={styles.editIcon}
                    onPress={() => handleEdit(item.id)}
                  />
                </View>
              </View>
            );
          }}
          keyExtractor={item => item.id.toString()}
        />
        <DateTimePickerModal
          isVisible={showPicker}
          mode="datetime"
          onConfirm={handleConfirm}
          onCancel={() => setShowPicker(false)}
        />
      </View>
    </View>
  );
};

export default Tasks;

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
    backgroundColor: '#E0FFFF',
    justifyContent: 'space-between',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  addText: {
    borderWidth: 1,
    borderColor: 'black',
    color: 'black',
    fontSize: 16,
    letterSpacing: 0.4,
    paddingHorizontal: 12,
    margin: 10,
    borderRadius: 5,
    width: '60%',
  },
  addIcon: {
    borderWidth: 1,
    borderColor: 'black',
    paddingHorizontal: 12,
    paddingVertical: 10.7,
    backgroundColor: '#003366',
    margin: 5,
    borderRadius: 5,
  },
  scheduleIcon: {
    padding: 10,
    marginTop: 5,
  },
  taskContainer: {
    borderWidth: 1,
    borderColor: '#003366',
    margin: 10,
    padding: 8,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  taskText: {
    fontSize: 17,
    letterSpacing: 0.3,
  },
  scheduleText: {
    fontSize: 12,
    color: '#444',
    marginLeft: 30,
    marginTop: 2,
  },
  deleteIcon: {
    borderWidth: 1,
    borderColor: 'red',
    paddingVertical: 4,
    paddingHorizontal: 3,
    borderRadius: 5,
    color: 'white',
    backgroundColor: 'red',
  },
  editIcon: {
    borderWidth: 1,
    borderColor: 'darkgreen',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 5,
    backgroundColor: 'green',
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginRight: 2,
  },
});
