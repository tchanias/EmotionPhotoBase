const mainBackgroundColor='#373737';
const mainElementColor="#05BD7D";
const textColor='#fff';
const buttonFont={
    fontSize:20,
    fontWeight:'400'
}
const titleFont={
    fontSize:24,
    fontWeight:'700'
}
const subTitleFont={
    fontSize:17,
    fontWeight:'700'
}
const textFont={
    fontSize:15,
    fontWeight:'400'
}

export const sharedStyles={
    textColor:textColor,
    elementColor:mainElementColor,
    backgroundColor:mainBackgroundColor,
    screen:{
        backgroundColor:mainBackgroundColor
    },
    detectorContainer: {
        backgroundColor:mainBackgroundColor,
        flex: 1,
        alignItems: 'center',
        alignSelf: 'center',
        backgroundColor: '#ccc',
        height:'100%',
        width:'100%',
      },
    buttonWrapper:{
       backgroundColor:mainBackgroundColor ,
       width:'100%',
       flexGrow:1,
       height:'100%'
    },
    detectorPhotoStyle:{
        maxHeight:440,
        position: 'relative',
        width: '100%',
        height: '100%',
        backgroundColor:mainBackgroundColor
      },
    button_text: {
        ...buttonFont,
        color: textColor,  
    },
    titleText: {
        ...titleFont,
        marginBottom: 10,
      },
      subTitleText: {
        ...subTitleFont,
        marginBottom: 4,
      },
}