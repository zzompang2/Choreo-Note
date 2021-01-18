import { StyleSheet, Dimensions } from 'react-native';

// 화면의 가로, 세로 길이 받아오기
const { width, height } = Dimensions.get('window');
const formationBoxHeight = 60;

export const COLORS = {
  white: '#F9F9F9',
  blackDark: '#191A1E',
	blackDarkTransparent: '#191A1Edd',
	blackMiddle: '#232323',
	blackLight: '#303030',
  grayDark: '#555555',
  grayMiddle: '#707070',
  grayLight: '#aaaaaa',
	yellow: '#EF9C1C',
	yellowLight: '#EF9C1C88',
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
		paddingVertical: 6,
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
		justifyContent: 'center',
	},
	stageSelected: {
		borderWidth: 5,
		borderColor: COLORS.yellow,
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
	},
	timebox: {
		width: 40,
		height: 40,
		backgroundColor: COLORS.grayMiddle,
		alignItems: 'center',
		justifyContent: 'center'
	},
	formationBox: {
		height: formationBoxHeight,
		// borderRadius: 10,
	},
	formationMarker: {
		position: 'absolute',
		height: formationBoxHeight,
		borderWidth: 5,
	},
	formationMarker__btn: {
		position: 'absolute',
		top: formationBoxHeight,
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
	toolBar: {
		width: '100%',
		height: 70,
		alignItems: 'center',
		justifyContent: 'center',
		flexDirection: 'row',
	},
	tool: {
		padding: 10,
	},
	itemSeparator: {
		height: 0.5,
		width: '100%',
	},
	dancerEntry: {
		flexDirection: 'row',
		width: '100%',
		height: 50,
		alignItems: 'center',
		paddingHorizontal: 10,
	},
	dancerEntry__color: {
		width: 30,
		height: 30,
		borderRadius: 20,
		alignItems: 'center',
		justifyContent: 'center',
		marginHorizontal: 12,
	},
	dancerEntry__input: {
		height: 42,
		flex: 1,
		paddingHorizontal: 10,
		color: COLORS.white,
	},
	dancerEntry__btn: {
		width: 50,
		height: 50,
		alignItems: 'center',
		justifyContent: 'center',
	},
	dancerEntry__btnIcon: {
		position: 'absolute',
		width: 10,
		height: 10,
		borderRadius: 5,
		backgroundColor: COLORS.blackMiddle,
	},
	dancerAddBtnContainer: {
		position: 'absolute',
		bottom: 20,
		right: 20,
		width: 70,
		height: 70,
		borderRadius: 40,
		alignItems: 'center',
		justifyContent: 'flex-end',
		flexDirection: 'row',
	},
	dancerControlBtn: {
		width: 60,
		height: 60,
		borderRadius: 40,
		margin: 5,
	},
	dancerAddBtn: {
		width: 30,
		height: 30,
		marginRight: 30,
		borderRadius: 20,
	}
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
	stageSelected: {
		...basicStyleSheet.stageSelected,
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
		backgroundColor: COLORS.white
	},
	timeline: {
		...basicStyleSheet.timeline,
		backgroundColor: COLORS.grayLight,
	},
	timebox: {
		...basicStyleSheet.timebox
	},
	timeMarker: {
		...basicStyleSheet.timeMarker
	},
	formationBox: {
		...basicStyleSheet.formationBox,
		backgroundColor: COLORS.grayDark,
	},
	formationBoxSelected: {
		...basicStyleSheet.formationBox,
		backgroundColor: COLORS.yellowLight,
	},
	formationMarker: {
		...basicStyleSheet.formationMarker,
		borderColor: COLORS.white,
		backgroundColor: COLORS.yellow
	},
	formationMarker__leftbtn: {
		...basicStyleSheet.formationMarker__btn,
		borderTopRightRadius: 0,
	},
	formationMarker__rightbtn: {
		...basicStyleSheet.formationMarker__btn,
		borderTopLeftRadius: 0,
	},
	toolBar: {
		...basicStyleSheet.toolBar,
		backgroundColor: COLORS.grayDark
	},
	tool: {
		...basicStyleSheet.tool,
		color: COLORS.white
	},
	toolDisabled: {
		...basicStyleSheet.tool,
		color: COLORS.grayLight
	},
	itemSeparator: {
		...basicStyleSheet.itemSeparator,
		backgroundColor: COLORS.blackDark,
	},
	dancerEntry: {
		...basicStyleSheet.dancerEntry,
	},
	dancerEntry__color: {
		...basicStyleSheet.dancerEntry__color,
		color: COLORS.white,
		backgroundColor: COLORS.yellow
	},
	dancerEntry__input: {
		...basicStyleSheet.dancerEntry__input,
	},
	dancerEntry__btn: {
		...basicStyleSheet.dancerEntry__btn,
	},
	dancerEntry__btnIcon: {
		...basicStyleSheet.dancerEntry__btnIcon,
	},
	dancerAddBtnContainer: {
		...basicStyleSheet.dancerAddBtnContainer,
		backgroundColor: COLORS.blackMiddle
	},
	dancerControlBtn: {
		...basicStyleSheet.dancerControlBtn,
		backgroundColor: COLORS.blackDark
	},
	dancerAddBtn: {
		...basicStyleSheet.dancerAddBtn,
		// backgroundColor: COLORS.red
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
		height: 15,
		paddingHorizontal: 10,
		alignItems: 'center'
	},
	dbTable: {
		fontSize: 10,
		color: COLORS.yellow,
	},
	dbText: {
		fontSize: 11,
		color: COLORS.white,
	},
	noteSubInfo: {
		...basicStyleSheet.noteSubInfo,
		color: COLORS.grayLight
	}
});

export default function getStyleSheet(theme) {
	switch(theme) {
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

const DANCER_COLORS_DARK = [
	COLORS.red,
	COLORS.yellow,
	COLORS.blue,
	COLORS.green,
];

const DANCER_COLORS_LIGHT = [
	COLORS.red,
	COLORS.yellow,
	COLORS.blue,
	COLORS.green,
];

export function getDancerColors(theme) {
	switch(theme) {
		case 'dark':
			return DANCER_COLORS_DARK;
		case 'light':
			return DANCER_COLORS_LIGHT;
		default:
			return DANCER_COLORS_DARK;
	}
}