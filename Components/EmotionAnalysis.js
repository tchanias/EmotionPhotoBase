import React from 'react';
import {View, Text} from 'react-native';
import {formatAsPercentage} from '../constants/constants';
import {sharedStyles} from '../sharedStyles';
import {Divider} from 'react-native-elements';
import capitalize from 'lodash/capitalize';

export default function EmotionAnalysis(props) {
  const {
    emotions,
    index,
    gender,
    age,
    smile,
    glasses,
    hairColor,
    hairColorConfidence,
    accessories,
    moustache,
    beard,
    bald,
    sideburns,
    makeup,
    facesLength,
  } = props;

  const getMakeupResult = function() {
    const eyeMakeup = makeup && makeup.eyeMakeup;
    const lipMakeup = makeup && makeup.lipMakeup;
    return makeup && (eyeMakeup || lipMakeup)
      ? eyeMakeup && !lipMakeup
        ? 'Eye Makeup'
        : !eyeMakeup && lipMakeup
        ? 'Lip Makeup'
        : eyeMakeup && lipMakeup
        ? 'Eye and Lip Makeup'
        : 'No Makeup'
      : 'No Makeup';
  };

  const glassTypeMap = {
    NoGlasses: 'No Glasses',
    ReadingGlasses: 'Reading Glasses',
    Sunglasses: 'Sunglasses',
    SwimmingGoggles: 'Swimming Goggles',
  };

  const glassesString = glasses && glassTypeMap[glasses];
  console.log(glassesString);

  return (
    <View style={styles.faceContainer} key={index}>
      <View>
        <Text style={sharedStyles.titleText}>Face #{parseInt(index) + 1}</Text>
      </View>
      <View style={styles.listColumn}>
        <Text style={sharedStyles.subTitleText}>Emotions</Text>
        <Text>Anger:{' ' + formatAsPercentage(emotions['anger'])}</Text>
        <Text>Contempt:{' ' + formatAsPercentage(emotions['contempt'])}</Text>
        <Text>Disgust:{' ' + formatAsPercentage(emotions['disgust'])}</Text>
        <Text>Fear:{' ' + formatAsPercentage(emotions['fear'])}</Text>
        <Text>
          Happiness:
          {' ' + formatAsPercentage(emotions['happiness'])}
        </Text>
        <Text>Neutral:{' ' + formatAsPercentage(emotions['neutral'])}</Text>
        <Text>Sadness:{' ' + formatAsPercentage(emotions['sadness'])}</Text>
        <Text>Surprise:{' ' + formatAsPercentage(emotions['surprise'])}</Text>
      </View>
      <View style={styles.listColumn}>
        <Text style={sharedStyles.subTitleText}>Appearance</Text>
        <Text>Bald:{' ' + formatAsPercentage(bald)}</Text>
        <Text>Moustache:{' ' + formatAsPercentage(moustache)}</Text>
        <Text>Beard:{' ' + formatAsPercentage(beard)}</Text>
        <Text>Sideburns:{' ' + formatAsPercentage(sideburns)}</Text>
        <Text>
          Makeup:
          {' ' + getMakeupResult()}
        </Text>
        <Text>
          Hair Color:{' ' + (capitalize(hairColor) || 'No hair')}{' '}
          {hairColorConfidence &&
            `- ${formatAsPercentage(hairColorConfidence)}`}
        </Text>
      </View>
      <View style={styles.listColumn}>
        <Text style={sharedStyles.subTitleText}>Other Results</Text>
        <Text>Gender:{' ' + capitalize(gender)}</Text>
        <Text>Age:{' ' + age}</Text>
        <Text>Smile:{' ' + formatAsPercentage(smile)}</Text>
        <Text>
          Glasses: {' ' + glassesString ? glassesString : 'No Glasses'}
        </Text>
        <Text>
          Accessories:{' '}
          {accessories &&
          accessories !== 'No Accessories' &&
          accessories.length > 0
            ? accessories.map((acc, index) => {
                return ` ${capitalize(acc.type)} ${' - ' +
                  formatAsPercentage(acc.confidence)}`;
              })
            : 'No Accessories'}
        </Text>
      </View>
      {parseInt(index) + 1 < facesLength && <Divider style={styles.divider} />}
    </View>
  );
}
const styles = {
  listColumn: {
    marginBottom: 10,
  },
  divider: {
    backgroundColor: '#009671',
  },
  faceContainer: {
    marginBottom: 10,
  },
};
