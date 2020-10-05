import React, {useState} from 'react';
import {Text, View, TouchableOpacity, Animated} from 'react-native';
import {Filters} from '../../constants/filters';
import {
  Container,
  Icon,
  Header,
  Content,
  Accordion,
  ListItem,
  Radio,
  Right,
  Left,
  ActionSheet,
} from 'native-base';
import {sharedStyles} from '../../sharedStyles';
import {ScrollView} from 'react-native-gesture-handler';
import {Picker} from '@react-native-community/picker';
import RNPickerSelect from 'react-native-picker-select';
import {Button} from 'react-native-elements';
import {Slider} from 'react-native-elements';
import MultiSlider from '@ptomasroos/react-native-multi-slider';

var BUTTONS = ['Brown', 'Blond', 'Black', 'Other', 'Gray', 'Red'];
var DESTRUCTIVE_INDEX = 3;
var CANCEL_INDEX = 6;

export default function SideBar(props) {
  const {filters, resetFilters, setFilters, isFiltered} = props;
  const [emotionsOpen, setEmotionsOpen] = useState(false);
  const [appearanceOpen, setAppearanceOpen] = useState(false);
  const [otherOpen, setOtherOpen] = useState(false);
  const [accessoriesOpen, setAccessoriesOpen] = useState(false);

  const selectEmotion = function(emotion) {
    let newFilters = filters;
    newFilters = {...newFilters, [emotion]: !filters[emotion]};
    setFilters(newFilters);
  };

  const selectOneEmotion = function(emotion) {
    let newFilters = filters;
    for (const [key, value] of Object.entries(Filters.Emotions)) {
      // console.log(`${key}: ${value}`);
      if (value === emotion) {
        newFilters = {...newFilters, [value]: true};
      } else {
        newFilters = {...newFilters, [value]: false};
      }
    }
    setFilters(newFilters);
  };

  const selectAccessory = function(accessory) {
    let newFilters = filters;
    newFilters = {
      ...newFilters,
      accessories: {
        ...filters.accessories,
        [accessory]: !filters.accessories[accessory],
      },
    };
    setFilters(newFilters);
  };

  const selectItem = function(item) {
    const previousItemValue = filters[item];
    let newFilters = filters;
    newFilters = {...newFilters, [item]: !previousItemValue};
    setFilters(newFilters);
  };

  const selectMakeup = function(item) {
    const previousItemValue = filters.makeup[item];
    let newFilters = filters;
    newFilters = {
      ...newFilters,
      makeup: {...newFilters.makeup, [item]: !previousItemValue},
    };
    setFilters(newFilters);
  };

  const selectHairColor = function(color) {
    let newFilters = filters;
    newFilters = {...newFilters, hairColor: color};
    setFilters(newFilters);
  };

  const itemChoice = function(element, value) {
    let newFilters = filters;
    if (newFilters[element] && newFilters[element] === value) {
      newFilters = {...newFilters, [element]: null};
    } else {
      newFilters = {...newFilters, [element]: value};
    }

    setFilters(newFilters);
  };

  const singleSetFilters = function(element, value) {
    let newFilters = {...filters, [element]: value};
    setFilters(newFilters);
  };

  return (
    <>
      <Content style={{backgroundColor: '#373737'}}>
        <View style={styles.formContainer}>
          <ScrollView>
            {/* Emotions Section  */}
            <View style={styles.formSection}>
              <TouchableOpacity
                onPress={() => {
                  setAppearanceOpen(false);
                  setOtherOpen(false);
                  setEmotionsOpen(!emotionsOpen);
                }}
                style={styles.formHeadButton}>
                <Icon
                  name={emotionsOpen ? 'happy-outline' : 'sad-outline'}
                  style={
                    emotionsOpen
                      ? [styles.categoryIcon, styles.categoryIconActive]
                      : styles.categoryIcon
                  }
                />
                <Text
                  style={
                    emotionsOpen
                      ? [styles.categoryName, styles.categoryNameActive]
                      : styles.categoryName
                  }>
                  Emotions
                </Text>
                <Icon
                  name={
                    emotionsOpen
                      ? 'chevron-down-outline'
                      : 'chevron-forward-outline'
                  }
                  style={
                    emotionsOpen
                      ? [styles.categoryOpenIcon, styles.categoryOpenIconActive]
                      : styles.categoryOpenIcon
                  }
                />
              </TouchableOpacity>
              <View
                style={emotionsOpen ? [styles.emotionForm] : {display: 'none'}}>
                <ScrollView style={styles.ScrollViewForm}>
                  {Object.keys(Filters.Emotions).map((emotion, index) => (
                    <ListItem
                      selected={false}
                      key={index}
                      style={styles.emotionListItem}
                      onPress={() => selectEmotion(emotion)}>
                      <Left>
                        <Text style={styles.emotionText}>
                          {Filters.EmotionTitles[emotion]}
                        </Text>
                      </Left>
                      <Right>
                        <Radio
                          color={'#009671'}
                          selectedColor={'#009671'}
                          selected={filters[emotion]}
                        />
                      </Right>
                    </ListItem>
                  ))}
                </ScrollView>
              </View>
            </View>
            {/* Emotions Section End  */}

            {/* Appearance Section */}
            <View style={styles.formSection}>
              <TouchableOpacity
                onPress={() => {
                  setEmotionsOpen(false);
                  setOtherOpen(false);
                  setAppearanceOpen(!appearanceOpen);
                }}
                style={styles.formHeadButton}>
                <Icon
                  name={appearanceOpen ? 'woman-outline' : 'man-outline'}
                  style={
                    appearanceOpen
                      ? [styles.categoryIcon, styles.categoryIconActive]
                      : styles.categoryIcon
                  }
                />
                <Text
                  style={
                    appearanceOpen
                      ? [styles.categoryName, styles.categoryNameActive]
                      : styles.categoryName
                  }>
                  Appearance
                </Text>
                <Icon
                  name={
                    appearanceOpen
                      ? 'chevron-down-outline'
                      : 'chevron-forward-outline'
                  }
                  style={
                    appearanceOpen
                      ? [styles.categoryOpenIcon, styles.categoryOpenIconActive]
                      : styles.categoryOpenIcon
                  }
                />
              </TouchableOpacity>
              <View
                style={
                  appearanceOpen ? [styles.appearanceForm] : {display: 'none'}
                }>
                <ScrollView style={styles.ScrollViewForm}>
                  <ListItem
                    selected={false}
                    style={styles.emotionListItem}
                    onPress={() => selectItem(Filters.Appearance.bald)}>
                    <Left>
                      <Text style={styles.emotionText}>{'Bald'}</Text>
                    </Left>
                    <Right>
                      <Radio
                        color={'#009671'}
                        selectedColor={'#009671'}
                        selected={filters[Filters.Appearance.bald]}
                      />
                    </Right>
                  </ListItem>
                  <ListItem
                    selected={false}
                    style={styles.emotionListItem}
                    onPress={() => selectItem(Filters.Appearance.moustache)}>
                    <Left>
                      <Text style={styles.emotionText}>{'Moustache'}</Text>
                    </Left>
                    <Right>
                      <Radio
                        color={'#009671'}
                        selectedColor={'#009671'}
                        selected={filters[Filters.Appearance.moustache]}
                      />
                    </Right>
                  </ListItem>
                  <ListItem
                    selected={false}
                    style={styles.emotionListItem}
                    onPress={() => selectItem(Filters.Appearance.beard)}>
                    <Left>
                      <Text style={styles.emotionText}>{'Beard'}</Text>
                    </Left>
                    <Right>
                      <Radio
                        color={'#009671'}
                        selectedColor={'#009671'}
                        selected={filters[Filters.Appearance.beard]}
                      />
                    </Right>
                  </ListItem>
                  <ListItem
                    selected={false}
                    style={styles.emotionListItem}
                    onPress={() => selectItem(Filters.Appearance.sideburns)}>
                    <Left>
                      <Text style={styles.emotionText}>{'Sideburns'}</Text>
                    </Left>
                    <Right>
                      <Radio
                        color={'#009671'}
                        selectedColor={'#009671'}
                        selected={filters[Filters.Appearance.sideburns]}
                      />
                    </Right>
                  </ListItem>
                  <ListItem
                    selected={false}
                    style={styles.emotionListItem}
                    onPress={() => selectMakeup(Filters.Appearance.eyemakeup)}>
                    <Left>
                      <Text style={styles.emotionText}>{'Eye makeup'}</Text>
                    </Left>
                    <Right>
                      <Radio
                        color={'#009671'}
                        selectedColor={'#009671'}
                        selected={filters.makeup[Filters.Appearance.eyemakeup]}
                      />
                    </Right>
                  </ListItem>
                  <ListItem
                    selected={false}
                    style={styles.emotionListItem}
                    onPress={() => selectMakeup(Filters.Appearance.lipmakeup)}>
                    <Left>
                      <Text style={styles.emotionText}>{'Lip makeup'}</Text>
                    </Left>
                    <Right>
                      <Radio
                        color={'#009671'}
                        selectedColor={'#009671'}
                        selected={filters.makeup[Filters.Appearance.lipmakeup]}
                      />
                    </Right>
                  </ListItem>
                  <ListItem selected={false}>
                    <Left>
                      <Text style={styles.emotionText}>{'Hair Color '}</Text>
                    </Left>
                    <Right style={styles.selectContainer}>
                      <RNPickerSelect
                        onValueChange={itemValue => selectHairColor(itemValue)}
                        mode={'dialog'}
                        style={{
                          viewContainer: styles.inputAndroidContainer,
                          headlessAndroidContainer:
                            styles.inputAndroidContainer,
                          inputAndroidContainer: styles.inputAndroidContainer,
                          inputAndroid: styles.inputAndroid,
                          iconContainer: styles.iconContainer,
                          placeholder: {
                            color: '#fff',
                            fontSize: 14,
                            fontWeight: 'normal',
                            flex: 1,
                            flexBasis: '100%',
                            width: '100%',
                          },
                        }}
                        value={filters.hairColor}
                        Icon={() => (
                          <Icon
                            name={
                              filters.hairColor
                                ? 'chevron-down-outline'
                                : 'chevron-forward-outline'
                            }
                            style={
                              emotionsOpen
                                ? [
                                    styles.categoryOpenIcon,
                                    styles.categoryOpenIconActive,
                                  ]
                                : styles.categoryOpenIcon
                            }
                          />
                        )}
                        placeholder={{label: 'None', value: null}}
                        useNativeAndroidPickerStyle={false}
                        items={[
                          {label: 'Brown', value: 'brown'},
                          {label: 'Blonde', value: 'blond'},
                          {label: 'Black', value: 'black'},
                          {label: 'Gray', value: 'gray'},
                          {label: 'Red', value: 'red'},
                          {label: 'Other', value: 'other'},
                        ]}
                      />
                    </Right>
                  </ListItem>
                </ScrollView>
              </View>
            </View>
            {/* Appearance Section End */}

            {/* Other Section */}
            <View style={styles.formSection}>
              <TouchableOpacity
                onPress={() => {
                  setEmotionsOpen(false);
                  setAppearanceOpen(false);
                  setOtherOpen(!otherOpen);
                }}
                style={styles.formHeadButton}>
                <Icon
                  name={otherOpen ? 'glasses-outline' : 'shirt-outline'}
                  style={
                    otherOpen
                      ? [styles.categoryIcon, styles.categoryIconActive]
                      : styles.categoryIcon
                  }
                />
                <Text
                  style={
                    otherOpen
                      ? [styles.categoryName, styles.categoryNameActive]
                      : styles.categoryName
                  }>
                  Other
                </Text>
                <Icon
                  name={
                    otherOpen
                      ? 'chevron-down-outline'
                      : 'chevron-forward-outline'
                  }
                  style={
                    otherOpen
                      ? [styles.categoryOpenIcon, styles.categoryOpenIconActive]
                      : styles.categoryOpenIcon
                  }
                />
              </TouchableOpacity>
              <View style={otherOpen ? [styles.otherForm] : {display: 'none'}}>
                <ScrollView style={styles.ScrollViewForm}>
                  <ListItem selected={false} style={styles.emotionListItem}>
                    <Left>
                      <Text style={styles.emotionText}>{'Gender'}</Text>
                    </Left>
                    <Right style={styles.choiceButtonContainer}>
                      <View
                        style={{
                          flex: 1,
                          flexBasis: '100%',
                          width: '100%',
                          justifyContent: 'flex-end',
                          // backgroundColor: 'yellow',
                          flexDirection: 'row',
                        }}>
                        <Button
                          buttonStyle={
                            filters.gender === 'female'
                              ? [styles.choiceButtonsActive, {marginRight: 20}]
                              : [
                                  styles.choiceButtonsInactive,
                                  {marginRight: 20},
                                ]
                          }
                          onPress={() =>
                            itemChoice(Filters.Names.gender, 'female')
                          }
                          icon={
                            <Icon
                              name="female-outline"
                              style={
                                filters.gender === 'female'
                                  ? styles.choiceIconsActive
                                  : styles.choiceIconsInactive
                              }
                            />
                          }
                          title=""
                        />
                        <Button
                          buttonStyle={
                            filters.gender === 'male'
                              ? styles.choiceButtonsActive
                              : styles.choiceButtonsInactive
                          }
                          onPress={() =>
                            itemChoice(Filters.Names.gender, 'male')
                          }
                          icon={
                            <Icon
                              name="male-outline"
                              style={
                                filters.gender === 'male'
                                  ? styles.choiceIconsActive
                                  : styles.choiceIconsInactive
                              }
                            />
                          }
                          title=""
                        />
                      </View>
                    </Right>
                  </ListItem>
                  <ListItem selected={false} style={styles.emotionListItem}>
                    <Left>
                      <Text style={styles.emotionText}>{`Age (${
                        filters.age[0]
                      } - ${filters.age[1]})`}</Text>
                    </Left>
                    <Right style={[styles.sliderContainer, {paddingRight: 10}]}>
                      <MultiSlider
                        values={filters.age}
                        onValuesChange={value =>
                          singleSetFilters(Filters.Names.age, value)
                        }
                        max={100}
                        sliderLength={100}
                        touchDimensions={{
                          height: 100,
                          width: 100,
                          borderRadius: 15,
                          slipDisplacement: 200,
                        }}
                      />
                    </Right>
                  </ListItem>
                  <ListItem
                    selected={false}
                    style={styles.emotionListItem}
                    onPress={() => selectItem(Filters.Names.smile)}>
                    <Left>
                      <Text style={styles.emotionText}>{'Smile'}</Text>
                    </Left>
                    <Right>
                      <Radio
                        color={'#009671'}
                        selectedColor={'#009671'}
                        selected={filters[Filters.Names.smile]}
                      />
                    </Right>
                  </ListItem>
                  <ListItem
                    selected={false}
                    style={styles.emotionListItem}
                    onPress={() => setAccessoriesOpen(!accessoriesOpen)}>
                    <Left>
                      <Text style={styles.emotionText}>{'Accessories'}</Text>
                    </Left>
                    <Right>
                      <Icon
                        name={
                          accessoriesOpen
                            ? 'chevron-down-outline'
                            : 'chevron-forward-outline'
                        }
                        style={
                          accessoriesOpen
                            ? [
                                styles.categoryOpenIconDark,
                                styles.categoryOpenIconActive,
                              ]
                            : styles.categoryOpenIconDark
                        }
                      />
                    </Right>
                  </ListItem>
                  <View
                    style={
                      accessoriesOpen
                        ? [styles.accessoriesForm]
                        : {display: 'none'}
                    }>
                    <ScrollView style={styles.ScrollViewForm}>
                      {Object.keys(Filters.Accessories).map((acc, index) => (
                        <ListItem
                          selected={false}
                          key={index}
                          style={styles.emotionListItem}
                          onPress={() => selectAccessory(acc)}>
                          <Left>
                            <Text style={styles.emotionText}>
                              {Filters.AccessoriesTitles[acc]}
                            </Text>
                          </Left>
                          <Right>
                            <Radio
                              color={'#009671'}
                              selectedColor={'#009671'}
                              selected={filters.accessories[acc]}
                            />
                          </Right>
                        </ListItem>
                      ))}
                    </ScrollView>
                  </View>
                </ScrollView>
              </View>
            </View>
            {/* Other Section End */}
          </ScrollView>
        </View>
      </Content>
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={
            isFiltered
              ? styles.filtersResetButton
              : styles.filtersResetButtonDisabled
          }
          disabled={!isFiltered}
          onPress={() => resetFilters()}>
          <Text
            style={
              isFiltered
                ? {fontSize: 18, color: '#009671'}
                : {fontSize: 18, color: 'black'}
            }>
            Reset
          </Text>
        </TouchableOpacity>
      </View>
    </>
  );
}

const styles = {
  formContainer: {
    backgroundColor: '#fff',
  },
  itemGroup: {
    backgroundColor: '#fff',
  },
  formHeadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 60,
    paddingHorizontal: 20,
  },
  categoryIcon: {
    flexBasis: '10%',
  },
  categoryIconActive: {
    color: '#009671',
  },
  categoryName: {
    flexBasis: '80%',
    fontSize: 18,
    paddingLeft: 20,
  },
  categoryNameActive: {
    color: '#009671',
  },
  categoryOpenIcon: {
    flexBasis: '10%',
  },
  categoryOpenIconActive: {
    color: '#009671',
  },
  categoryOpenIconDark: {
    color: '#fff',
    flexBasis: '10%',
  },
  emotionForm: {
    height: 400,
    backgroundColor: '#373737',
  },
  appearanceForm: {
    height: 400,
    backgroundColor: '#373737',
  },
  otherForm: {
    height: 400,
    backgroundColor: '#373737',
  },
  accessoriesForm: {
    height: 210,
    backgroundColor: '#373737',
    paddingHorizontal: 10,
  },
  ScrollViewForm: {},
  emotionListItem: {},
  emotionText: {
    color: '#fff',
  },
  actionButtons: {
    width: '100%',
    position: 'absolute',
    bottom: 0,
  },
  filtersResetButton: {
    flex: 1,
    height: 60,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  filtersResetButtonDisabled: {
    flex: 1,
    height: 60,
    backgroundColor: 'rgba(255,255,255,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectContainer: {
    flexBasis: '50%',
    padding: 0,
    margin: 0,
    // width: 500,
    height: 40,
    // display: 'flex',
  },
  inputAndroidContainer: {
    flexBasis: '100%',
    // width: '100%',
    flex: 1,
  },
  inputAndroid: {
    minWidth: 150,
    padding: 0,
    margin: 0,
    height: 40,
    color: '#fff',
    width: '100%',
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
    textAlign: 'right',
    paddingRight: 10,
    fontSize: 18,
    // minWidth: 400,
    // alignSelf: 'stretch',
  },
  iconContainer: {
    position: 'relative',
    // display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    display: 'none',
    // top: 8,
    // right: 10,
  },
  choiceButtonContainer: {
    flexBasis: '40%',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  choiceButtonsActive: {
    backgroundColor: '#fff',
  },
  choiceButtonsInactive: {
    backgroundColor: 'rgba(255,255,255,0.7)',
  },
  choiceIconsActive: {
    color: '#009671',
  },
  choiceIconsInactive: {
    color: 'black',
  },
  sliderContainer: {
    flexBasis: '40%',
  },
};
