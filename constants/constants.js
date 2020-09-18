import AsyncStorage from '@react-native-community/async-storage';
export const subKey = '2bfab510b0f54217b9b3f06cf810af12';
export const faceApi =
  'https://emotion-detector.cognitiveservices.azure.com/face/v1.0/detect';
// export const faceApi = 'https://westus.api.cognitive.microsoft.com/face/v1.0/detect';
export const parameters = {
  returnFaceId: 'true',
  returnFaceLandmarks: 'false',
  returnFaceAttributes:
    'age,gender,headPose,smile,facialHair,glasses,emotion,' +
    'hair,makeup,occlusion,accessories,blur,exposure,noise',
};
// export const headers = {
// 'Accept': 'application/json',
//     "Content-Type":"application/json",
//     "Ocp-Apim-Subscription-Key": subKey
//     // "Subscription-Key": subKey
// }
export const appName = {
  camelCase: 'emotionPhotoBase',
  capital: 'EMOTIONPHOTOBASE',
  directory: 'EmotionPhotoBase',
  lowercase: 'emotionphotobase',
};

export const headers = {
  Accept: 'application/json',
  'Content-Type': 'application/octet-stream',
  'Ocp-Apim-Subscription-Key': subKey,
  // "Subscription-Key": subKey
};

export const oathClient =
  '629406086382-s5q2gsevlu29dkmkn63ffo5nnecmttb0.apps.googleusercontent.com';

export const removeExtension = function(filename) {
  var lastDotPosition = filename.lastIndexOf('.');
  if (lastDotPosition === -1) return filename;
  else return filename.substr(0, lastDotPosition);
};

export const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;

export const clearAsyncStorage = async () => {
  AsyncStorage.clear();
};
// export function parseUrlParams(urlParams) {
//     const joinByEquals = (pair) => pair.join('=')
//     const params = Object.entries(urlParams).map(joinByEquals).join('&')
//     if (params) {
//         return `?${params}`
//     } else {
//     return ''
//     }
// }

export const apiUrl =
  faceApi +
  '?' +
  'returnFaceId=true&returnFaceLandmarks=false&returnFaceAttributes=age%2Cgender%2CheadPose%2Csmile%2CfacialHair%2Cglasses%2Cemotion%2Chair%2Cmakeup%2Cocclusion%2Caccessories%2Cblur%2Cexposure%2Cnoise';
