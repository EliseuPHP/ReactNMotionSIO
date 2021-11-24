/* eslint-disable react-native/no-inline-styles */
/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 *
 * @format
 */

import React, {useState} from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  View,
  TextInput,
  Pressable,
  ToastAndroid,
} from 'react-native';

import Ionicon from 'react-native-vector-icons/Ionicons';
import RNRestart from 'react-native-restart';

import {Colors} from 'react-native/Libraries/NewAppScreen';

//Motion Sensor
import {
  gyroscope,
  setUpdateIntervalForType,
  SensorTypes,
} from 'react-native-sensors';

//Sockets
import io from 'socket.io-client';

setUpdateIntervalForType(SensorTypes.accelerometer, 250); // defaults to 100ms
setUpdateIntervalForType(SensorTypes.magnetometer, 250); // defaults to 100ms
setUpdateIntervalForType(SensorTypes.gyroscope, 25); // defaults to 100ms

const Section: React.FC<{
  title: string;
}> = ({children, title}) => {
  const isDarkMode = useColorScheme() === 'dark';
  return (
    <View style={styles.sectionContainer}>
      <Text
        style={[
          styles.sectionTitle,
          {
            color: isDarkMode ? Colors.white : Colors.black,
          },
        ]}>
        {title}
      </Text>
      <Text
        style={[
          styles.sectionDescription,
          {
            color: isDarkMode ? Colors.light : Colors.dark,
          },
        ]}>
        {children}
      </Text>
    </View>
  );
};

const App = () => {
  const isDarkMode = useColorScheme() === 'dark';

  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };

  const [canEmmit, setCanEmmit] = useState(false);
  const [sideSelect, setSideSelect] = useState(false);
  const [buttonSelected, setButtonSelected] = useState(true);
  const [text, onChangeText] = React.useState('');
  let phoneRotation = '270';
  const [socketError, setSocketError] = useState('No Error');

  let motionGyro = {
    x: 0.0,
    z: 0.0,
    y: 0.0,
    phoneRotation: phoneRotation,
  };

  // Creating Socket Connection
  const PORT = '3001';
  let IPAdress = '192.168.0.50' + ':' + PORT;
  const socket = io('http://192.168.0.50:3001', {
    forceNew: true,
    autoConnect: false,
  });

  function socketConnect() {
    socket.connect();
    socket.on('connect', () => {
      setSideSelect(true);
      console.log('Socket Connected: ' + socket.connected);
      setSocketError('Socket Connected: ' + socket.connected);
      console.log('Socket ID: ' + socket.id);
      subscriptionGyroAsync();
    });
  }

  function socketDisconnect() {
    socket.disconnect();
    socket.on('disconnect', data => {
      setSideSelect(false);
      console.log('Socket Disconnected: ' + data);
    });
    RNRestart.Restart();
  }

  socket.io.on('error', error => {
    setSocketError(error.toString());
    showToastWithGravityAndOffset(error.toString());
  });

  const showToastWithGravityAndOffset = (textToast: string) => {
    ToastAndroid.showWithGravityAndOffset(
      textToast,
      ToastAndroid.LONG,
      ToastAndroid.BOTTOM,
      25,
      50,
    );
  };

  const subscriptionGyroAsync = () => {
    return new Promise((resolve, reject) => {
      gyroscope.subscribe({
        next: x => {
          motionGyro.x = x.x;
          motionGyro.y = x.y;
          motionGyro.z = x.z;
          // motionGyro.phoneRotation = phoneRotation;
          let gyroString = updateMotion(motionGyro);
          // console.log(gyroString);
          emitMessage(gyroString);
        },
      });
    });
  };

  async function emitMessage(gyroString: string) {
    socket.emit('message', gyroString);
  }

  function updateMotion(_object: {
    x: number;
    z: number;
    y: number;
    phoneRotation: string;
  }) {
    if (phoneRotation === '270') {
      _object.phoneRotation = '270';
    }
    if (phoneRotation === '0') {
      _object.phoneRotation = '0';
    }
    return JSON.stringify(_object).replace(/"/g, "'");
  }

  return (
    <SafeAreaView style={backgroundStyle}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        style={backgroundStyle}>
        <View
          style={{
            backgroundColor: isDarkMode ? Colors.black : Colors.white,
          }}>
          <Section title="Connection">
            <Text>Enter the IP Address</Text>
          </Section>
          <TextInput
            editable={false}
            style={styles.input}
            onChangeText={onChangeText}
            value={text}
            placeholder={IPAdress}
            keyboardType="numeric"
            maxLength={15}
          />
          <Pressable
            style={styles.button}
            disabled={sideSelect}
            onPress={() => {
              // IPAdress = text + ':' + PORT;
              console.log('butao');
              showToastWithGravityAndOffset('Button Clicked');
              console.log('Trying to Connect to: ' + IPAdress);
              socketConnect();
            }}>
            <Text style={styles.textButton}>Connect</Text>
          </Pressable>
          <Pressable
            style={styles.button}
            disabled={!sideSelect}
            onPress={() => {
              socket.emit('quitpls');
              socketDisconnect();
              // subscriptionGyro.unsubscribe();
              setCanEmmit(!canEmmit);
              console.log(canEmmit);
            }}>
            <Text style={styles.textButton}>
              {canEmmit ? 'Disconnecting...' : 'Disconnect'}
            </Text>
          </Pressable>
          <Section title="Cellphone position">
            <Text>
              Please, before connecting, choose the position which your cell
              phone is mounted
            </Text>
          </Section>
          <View style={styles.row}>
            <View>
              <Pressable
                key="twos"
                disabled={sideSelect}
                style={[
                  styles.sButton,
                  {backgroundColor: buttonSelected ? 'coral' : '#2196F3'},
                ]}
                onPress={() => {
                  setButtonSelected(true);
                  phoneRotation = '270';
                  // showToastWithGravityAndOffset(phoneRotation);
                }}>
                <Ionicon
                  name="phone-landscape-outline"
                  color="#FFF"
                  size={50}
                />
                <Text style={styles.textButton}>Landscape</Text>
              </Pressable>
            </View>
            <View>
              <Pressable
                disabled={sideSelect}
                style={[
                  styles.sButton,
                  {backgroundColor: buttonSelected ? '#2196F3' : 'coral'},
                ]}
                onPress={() => {
                  setButtonSelected(false);
                  phoneRotation = '0';
                  // showToastWithGravityAndOffset(phoneRotation);
                }}>
                <Ionicon name="phone-portrait-outline" color="#FFF" size={50} />
                <Text style={styles.textButton}>Portrait</Text>
              </Pressable>
            </View>
          </View>
          <Section title="Socket IO Log">
            <Text>{socketError}</Text>
          </Section>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '400',
  },
  highlight: {
    fontWeight: '700',
  },
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 4,
    elevation: 3,
    marginTop: 8,
    marginLeft: 24,
    marginRight: 24,
    backgroundColor: '#2196F3',
    borderColor: '#000000',
  },
  sButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    width: 116,
    borderRadius: 4,
    elevation: 3,
    marginTop: 8,
    backgroundColor: '#2196F3',
    borderColor: '#000000',
  },
  selected: {
    backgroundColor: 'coral',
  },
  textButton: {
    color: '#FFFFFF',
  },
  input: {
    marginTop: 8,
    marginLeft: 24,
    marginRight: 24,
    borderWidth: 1,
    borderRadius: 4,
  },
});

export default App;
