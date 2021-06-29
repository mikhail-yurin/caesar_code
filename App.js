import React, {useState, useEffect} from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  View,
  TextInput,
  ScrollView,
  ToastAndroid,
  TouchableOpacity,
  NativeModules,
  useColorScheme,
} from 'react-native';
import {Colors} from 'react-native/Libraries/NewAppScreen';
import Clipboard from '@react-native-community/clipboard';

const alph = {
  ru: 'абвгдеёжзийклмнопрстуфхцчшщъыьэюя'.split(''),
  en: 'abcdefghijklmnopqrstuvwxyz'.split(''),
};

const App: () => Node = () => {
  const [inputText, setInputText] = useState('');
  const [decodedText, setDecodedText] = useState('');
  const [language, setLanguage] = useState('en');
  const [themeStyle, setThemeStyle] = useState();

  const detectLang = input => {
    if (typeof input === 'string') {
      const firstLetter = input.split('').find(char => alph.ru.includes(char) || alph.en.includes(char));
      if (firstLetter && alph.ru.includes(firstLetter)) {
        setLanguage('ru');
      } else if (firstLetter && alph.en.includes(firstLetter)) {
        setLanguage('en');
      }
    }
  };

  const clearOrPaste = () => {
    if (inputText) {
      setInputText('');
    } else {
      Clipboard.getString()
        .then(data => {
          setInputText(data);
        })
        .catch(err => {
          ToastAndroid.showWithGravityAndOffset('Clipboard is empty', ToastAndroid.LONG, ToastAndroid.TOP, 25, 50);
        });
    }
  };

  const getCaesarCipher = input => {
    if (typeof input === 'string') {
      let possibleDecodedPhrases = [];
      // possibleDecodedPhrases.push(input + ' - IS ORIGINAL'); // ! for debug

      for (let shift = 1; shift <= alph[language].length; shift++) {
        const possibleDecodedPhrase = input
          .toLowerCase()
          .split('')
          .map(char => {
            if (alph[language].includes(char)) {
              let index = alph[language].indexOf(char) + shift;
              while (!alph[language][index]) {
                index -= alph[language].length;
              }
              return alph[language][index];
            } else {
              return char;
            }
          })
          .join('');

        possibleDecodedPhrases.push(possibleDecodedPhrase);
      }
      return possibleDecodedPhrases;
    } else {
      return '';
    }
  };

  const copy = text => {
    Clipboard.setString(text);
    ToastAndroid.showWithGravityAndOffset('Copied to clipboard', ToastAndroid.LONG, ToastAndroid.TOP, 25, 50);
    // fix: forceUpdate();
  };

  useEffect(() => {
    let langRegionLocale = 'en_US';
    if (Platform.OS === 'android') {
      langRegionLocale = NativeModules.I18nManager.localeIdentifier || '';
    } else if (Platform.OS === 'ios') {
      langRegionLocale = NativeModules.SettingsManager.settings.AppleLocale || '';
    }
    setLanguage(langRegionLocale.substring(0, 2) || 'en');
  }, []);

  const isDarkMode = useColorScheme() === 'dark';
  useEffect(() => {
    setThemeStyle({
      backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
      color: isDarkMode ? Colors.lighter : Colors.darker,
    });
  }, [isDarkMode]);

  useEffect(() => {
    detectLang(inputText);
    setDecodedText(getCaesarCipher(inputText));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inputText]);

  return (
    <View style={{...styles.container, ...themeStyle}}>
      <Text style={{...styles.inctructions, ...themeStyle}}>Enter some text below:</Text>

      <View style={{...styles.controls, themeStyle}}>
        <TextInput style={{...styles.input, ...themeStyle}} multiline={true} onChangeText={setInputText} value={inputText} />

        <TouchableOpacity style={styles.button} onPress={clearOrPaste}>
          <Text style={styles.buttonText}>{inputText ? 'clear' : 'paste'}</Text>
        </TouchableOpacity>
      </View>

      {inputText ? (
        <View style={themeStyle}>
          <Text style={{color: gray}}>languale is: {language.toUpperCase()}</Text>
        </View>
      ) : null}

      {inputText ? (
        <View style={themeStyle}>
          <Text style={{...styles.inctructions, ...themeStyle}}>Possible variants of Caesar cipher (longpress to copy):</Text>
        </View>
      ) : null}

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {typeof decodedText === 'object'
          ? decodedText.map((text, index) =>
              text ? (
                <TouchableOpacity key={index} style={{...styles.touchableView, ...themeStyle}} onLongPress={() => copy(text)}>
                  <Text style={{...themeStyle, ...styles.codeView}}>{index + 1}:</Text>
                  <Text style={{...styles.decodedTextView, ...themeStyle}}>{text}</Text>
                </TouchableOpacity>
              ) : null,
            )
          : null}
      </ScrollView>
    </View>
  );
};

const orange = '#ff9933';
const gray = '#AAAAAA';
const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    height: '100%',
    width: '100%',
    paddingLeft: 20,
    paddingRight: 20,
  },
  centered: {
    textAlign: 'center',
  },
  controls: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'nowrap',
    height: 40,
    borderColor: orange,
    borderWidth: 1,
  },
  input: {
    height: '100%',
    flex: 1,
    marginLeft: 8,
  },
  button: {
    marginLeft: 4,
    height: '100%',
    alignSelf: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 20,
    color: orange,
    marginLeft: 8,
    marginRight: 8,
    marginBottom: 4, // todo: should be vertical center
  },
  inctructions: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  decodedTextView: {
    fontSize: 16,
    textAlign: 'left',
    color: '#333333',
    marginBottom: 20,
    width: '100%',
  },
  codeView: {
    fontSize: 16,
    textAlign: 'left',
    color: gray,
    marginRight: 10,
  },
  touchableView: {
    width: '100%',
    flexDirection: 'row',
  },
  scrollContainer: {
    paddingVertical: 10,
    alignItems: 'flex-start',
  },
});

export default App;
