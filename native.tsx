import {
  accelerometer,
  gyroscope,
  magnetometer,
  setUpdateIntervalForType,
  SensorTypes,
} from 'react-native-sensors';
import io from 'socket.io-client';
setUpdateIntervalForType(SensorTypes.gyroscope, 25);
{...}
  // Objeto que recebe os valores x, y e z do giroscópio do celular
  let motionObject = {
    Gyroscope: {
      x: 0.0,
      z: 0.0,
      y: 0.0,
    }
  };
{...}
  // Criando a conexão com o socket
  const socket = io('http://192.168.0.50:1234', {
    forceNew: true,
    autoConnect: false,
  });
  function socketConnect() {
    socket.connect();
  }
{...}
  // Funções para enviar os dados do sensor para o servidor
  function updateMotion() {
    motionString = JSON.stringify(motionObject.Gyroscope).replace(/"/g, "'");
  }
  const subscriptionGyro = gyroscope.subscribe({
    next: x => {
      motionObject.Gyroscope.x = x.x;
      motionObject.Gyroscope.y = x.y;
      motionObject.Gyroscope.z = x.z;
      updateMotion();
      socket.emit('message', motionString);
      // }
    },
  });
{...}
