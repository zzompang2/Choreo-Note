import { StyleSheet, Dimensions } from 'react-native';

// 화면의 가로, 세로 길이 받아오기
const { width, height } = Dimensions.get('window');
const positionboxHeight = 60;

export const COLORS = {
  white: '#F9F9F9',
  blackDark: '#191A1E',
	blackDarkTransparent: '#191A1Edd',
	blackLight: '#303030',
  grayDark: '#555555',
  grayMiddle: '#707070',
  grayLight: '#aaaaaa',
  yellow: '#EF9C1C',
  red: '#D63F72',
  purple: '#B036BC',
  blue: '#4469EB',
  green: '#3CAEA3',
}

const basicStyleSheet = StyleSheet.create({
	bg: {
		flex: 1
	},
	toolbar: {
		width: '100%',
		height: 50,
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		paddingHorizontal: 10,
	},
	toolbarTitle: {
		fontSize: 24,
		fontWeight: "bold"
	},
	toolbarButton: {
		fontSize: 15,
		paddingVertical: 15,
		paddingHorizontal: 10
	},
	noteList: {
		flex: 1,
	},
	noteEntry: {
		flexDirection: 'column',
		height: 60,
		alignItems: 'flex-start',
		paddingHorizontal: 10,
		justifyContent: 'center'
	},
	noteTitle: {
		fontSize: 18
	},
	noteSubInfo: {
		fontSize: 14
	},
	stage: {
		width: width,
		height: width,
		alignItems: 'center',
		justifyContent: 'center'
	},
	stageAxis: {
		position: 'absolute',
		alignItems: 'center',
		justifyContent: 'center',
		width: '100%'
	},
	stageAxisVertical: {
		position: 'absolute',
		// width: 1,
		height: '100%',
	},
	stageAxisHorizontal: {
		position: 'absolute',
		width: '100%',
		// height: 1,
	},
	dancer: {
		position: 'absolute',
		width: 30,
		height: 30,
		borderRadius: 15,
		alignItems: 'center',
		justifyContent: 'center'
	},
	timeline: {
		width: '100%',
		backgroundColor: COLORS.grayLight,
	},
	timebox: {
		width: 40,
		height: 40,
		backgroundColor: COLORS.red,
		alignItems: 'center',
		justifyContent: 'center'
	},
	positionbox: {
		height: positionboxHeight,
		backgroundColor: COLORS.blue,
	},
	positionbox__btn: {
		position: 'absolute',
		top: positionboxHeight,
		left: -30,
		width: 30,
		height: 30,
		borderRadius: 15,
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: COLORS.blackDark
	},
	timeMarker: {
		position: 'absolute', 
		width: 30, 
		height: 30, 
		borderWidth: 1, 
		borderColor: COLORS.blackDark,
		borderRadius: 15,
		margin: 5
	},
});

const darkStyleSheet = StyleSheet.create({
	bg: {
		...basicStyleSheet.bg,
		backgroundColor: COLORS.blackLight,
	},
	toolbar: {
		...basicStyleSheet.toolbar,
		backgroundColor: COLORS.blackDarkTransparent,
	},
	toolbarTitle: {
		...basicStyleSheet.toolbarTitle,
		color: COLORS.white,
	},
	toolbarButton: {
		...basicStyleSheet.toolbarButton,
		color: COLORS.white,
	},
	noteList: {
		...basicStyleSheet.noteList,
	},
	noteEntry: {
		...basicStyleSheet.noteEntry,
	},
	noteTitle: {
		...basicStyleSheet.noteTitle,
		color: COLORS.white,
	},
	noteSubInfo: {
		...basicStyleSheet.noteSubInfo,
		color: COLORS.grayLight
	},
	stage: {
		...basicStyleSheet.stage,
		backgroundColor: COLORS.grayDark
	},
	stageAxis: {
		...basicStyleSheet.stageAxis
	},
	stageAxisVertical: {
		...basicStyleSheet.stageAxisVertical,
		backgroundColor: COLORS.grayMiddle
	},
	stageAxisHorizontal: {
		...basicStyleSheet.stageAxisHorizontal,
		backgroundColor: COLORS.grayMiddle
	},
	dancer: {
		...basicStyleSheet.dancer,
		backgroundColor: COLORS.yellow
	},
	timeline: {
		...basicStyleSheet.timeline
	},
	timebox: {
		...basicStyleSheet.timebox
	},
	positionbox: {
		...basicStyleSheet.positionbox
	},
	timeMarker: {
		...basicStyleSheet.timeMarker
	},
	positionbox__leftbtn: {
		...basicStyleSheet.positionbox__btn,
		borderTopRightRadius: 0,
	},
	positionbox__rightbtn: {
		...basicStyleSheet.positionbox__btn,
		borderTopLeftRadius: 0,
	}
});

const lightStyleSheet = StyleSheet.create({
	toolbar: {
		width:'100%', 
		height:50, 
		flexDirection: 'row', 
		backgroundColor:COLORS.purple, 
		alignItems: 'center', 
		justifyContent: 'space-between', 
	}
});

const dbStyleSheet = StyleSheet.create({
	bg: {
		...basicStyleSheet.bg,
		backgroundColor: COLORS.blackLight,
	},
	toolbar: {
		...basicStyleSheet.toolbar,
		backgroundColor: COLORS.blackDarkTransparent,
	},
	toolbarTitle: {
		...basicStyleSheet.toolbarTitle,
		color: COLORS.white,
	},
	toolbarButton: {
		...basicStyleSheet.toolbarButton,
		color: COLORS.white,
	},
	noteList: {
		...basicStyleSheet.noteList,
	},
	dbEntry: {
		flexDirection: 'row',
		height: 20,
		paddingHorizontal: 10,
		alignItems: 'center'
	},
	dbTable: {
		fontSize: 13,
		color: COLORS.yellow,
	},
	dbText: {
		fontSize: 13,
		color: COLORS.white,
	},
	noteSubInfo: {
		...basicStyleSheet.noteSubInfo,
		color: COLORS.grayLight
	}
});

export default function getStyleSheet(themeType) {
	switch(themeType) {
		case 'dark':
			return darkStyleSheet;
		case 'light':
			return lightStyleSheet;
		case 'basic':
			return basicStyleSheet;
		case 'database':
			return dbStyleSheet;
		default:
			return darkStyleSheet;
	}
}