/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * Generated with the TypeScript template
 * https://github.com/react-native-community/react-native-template-typescript
 *
 * @format
 */

import React, {useRef, useState} from 'react';
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
} from 'react-native';

import {
  Colors,
  DebugInstructions,
  Header,
  LearnMoreLinks,
  ReloadInstructions,
} from 'react-native/Libraries/NewAppScreen';

//Motion Sensor
import {
  accelerometer,
  gyroscope,
  magnetometer,
  setUpdateIntervalForType,
  SensorTypes,
} from 'react-native-sensors';

//Sockets
import io from 'socket.io-client';

setUpdateIntervalForType(SensorTypes.accelerometer, 250); // defaults to 100ms
setUpdateIntervalForType(SensorTypes.magnetometer, 250); // defaults to 100ms
setUpdateIntervalForType(SensorTypes.gyroscope, 50); // defaults to 100ms

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

  let motionObject = {
    Accelerometer: {
      x: 0.0,
      z: 0.0,
      y: 0.0,
    },
    Gyroscope: {
      x: 0.0,
      z: 0.0,
      y: 0.0,
    },
    Magnetometer: {
      x: 0.0,
      z: 0.0,
      y: 0.0,
    },
  };

  // Live Values
  const [motionState, motionChange] = useState(motionObject);

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
      console.log('Socket ID: ' + socket.id);
    });
  }

  function socketDisconnect() {
    socket.disconnect();
    socket.on('disconnect', data => {
      console.log('Socket Disconnected: ' + data);
    });
  }

  socket.on('connect', () => {
    console.log('Socket Connected: ' + socket.connected);
  });

  socket.on('disconnect', data => {
    console.log('Socket Disconnected: ' + data);
  });

  let motionString = '';

  // Motion Sensor Data
  const subscriptionAcc = accelerometer.subscribe({
    next: x => {
      motionObject.Accelerometer.x = x.x;
      motionObject.Accelerometer.y = x.y;
      motionObject.Accelerometer.z = x.z;
      updateMotion();
    },
  });
  const subscriptionMagnet = magnetometer.subscribe({
    next: x => {
      motionObject.Magnetometer.x = x.x;
      motionObject.Magnetometer.y = x.y;
      motionObject.Magnetometer.z = x.z;
      updateMotion();
    },
  });
  const subscriptionGyro = gyroscope.subscribe({
    next: x => {
      motionObject.Gyroscope.x = x.x;
      motionObject.Gyroscope.y = x.y;
      motionObject.Gyroscope.z = x.z;
      // console.log(motionObject.Gyroscope);
      updateMotion();
      if ((x.x != 0.0 || x.y != 0.0 || x.z != 0.0) && socket.connected) {
        socket.emit('message', motionString);
      }
    },
  });

  function updateMotion() {
    motionString = JSON.stringify(motionObject).replace(/"/g, "'");
    motionChange(motionObject);
  }

  const [text, onChangeText] = React.useState('');
  const [connectionText, setConnectionText] = React.useState('Connect!!');

  return (
    <SafeAreaView style={backgroundStyle}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        style={backgroundStyle}>
        <Header />
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
            onPress={() => {
              IPAdress = text + ':' + PORT;
              console.log('butao');
              if (socket.disconnected) {
                console.log('Trying to Connect to: ' + IPAdress);
                socketConnect();
                setConnectionText('Disconnect :(');
              } else {
                console.log('Trying to Disconnect from: ' + IPAdress);
                socketDisconnect();
                setConnectionText('Connect!!');
              }
            }}>
            <Text>{connectionText}</Text>
          </Pressable>
          <Section title="Emit Motion Sensor Data">
            <Text>Click the Button to Emit Sensor Data to Socket IO</Text>
          </Section>
          <Pressable
            style={styles.button}
            onPress={() => {
              socket.emit('message', motionString),
                console.log('Message Sent: ', motionString);
            }}>
            <Text style={styles.highlight}>Emit!!</Text>
          </Pressable>
          <Section title="Accelerometer">
            <Text>
              Y: {motionState.Accelerometer.y}
              {'\n'}
            </Text>
            <Text>
              X: {motionState.Accelerometer.x}
              {'\n'}
            </Text>
            <Text>
              Z: {motionState.Accelerometer.z}
              {'\n'}
            </Text>
          </Section>
          <Section title="Gyroscope">
            <Text>
              Y: {motionState.Gyroscope.y}
              {'\n'}
            </Text>
            <Text>
              X: {motionState.Gyroscope.x}
              {'\n'}
            </Text>
            <Text>
              Z: {motionState.Gyroscope.z}
              {'\n'}
            </Text>
          </Section>
          <Section title="Magnetometer">
            <Text>
              Y: {motionState.Magnetometer.y}
              {'\n'}
            </Text>
            <Text>
              X: {motionState.Magnetometer.x}
              {'\n'}
            </Text>
            <Text>
              Z: {motionState.Magnetometer.z}
              {'\n'}
            </Text>
          </Section>
          <Section title="Learn More">
            Read the docs to discover what to do next:
          </Section>
          <LearnMoreLinks />
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
  input: {
    marginTop: 8,
    marginLeft: 24,
    marginRight: 24,
    borderWidth: 1,
    borderRadius: 4,
  },
});

export default App;
