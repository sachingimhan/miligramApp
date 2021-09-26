import AsyncStorage from '@react-native-async-storage/async-storage';

export default AuthCheckMiddleWare = async (cb) => {
  try {
    const user = await AsyncStorage.getItem('@user');
    if (user) {
      cb(null,true, JSON.parse(user));
    } else {
      cb(null,false, null);
    }
  } catch (error) {
    cb(error,false,null);
  }
};
