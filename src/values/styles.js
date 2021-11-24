import { StyleSheet, Dimensions } from 'react-native';

// 화면의 가로, 세로 길이 받아오기
const { width, height } = Dimensions.get('window');
const formationBoxHeight = 60;
const unitBoxWidth = 10;

export const COLORS = {
  container_white: '#ffffff',
  container_black: '#000000',
	container_10: '#1e1e1e',
	container_20: '#2B2B2B',
	container_20_80: 'rgba(43, 43, 43, .8)',
	container_30: '#646464',
  container_40: '#8D8D8D',
	abnormal: "#EB5757",
	yellow: '#EF9C1C',
	yellowLight: '#EF9C1C88',
	red: '#D63F72',
	orange: '#ce4102',
  purple: '#8249d3', 
  blue: '#4469EB',
  green: '#00817a',
	pink: '#CB5692',
}

const DANCER_COLORS_DARK = [
	COLORS.pink,
	COLORS.orange,
	COLORS.purple,
	COLORS.green,
];

const DANCER_COLORS_LIGHT = [
	COLORS.red,
	COLORS.yellow,
	COLORS.blue,
	COLORS.green,
];

const basicStyleSheet = StyleSheet.create({
	bg: {
		flex: 1,
	},
	navigationBar: {
		width: '100%',
		height: 50,
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		// paddingHorizontal: 10,
	},
	navigationBar__title: {
		fontSize: 20,
		fontFamily: 'GmarketSansTTFMedium',
		// paddingLeft: 12,
	},
	navigationBar__button: {
		fontSize: 16,
		// paddingVertical: 15,
		paddingRight: 10,
		// backgroundColor: COLORS.red
	},
	navigationBarText: {
		fontSize: 16,
		// paddingVertical: 17,
		paddingHorizontal: 20,
		color: COLORS.pink,
		fontFamily: 'GmarketSansTTFMedium',
	},
	noteList: {
		flex: 1,
		// paddingVertical: 6,
		padding: 8,
		// backgroundColor: 'yellow',
	},
	noteEntry: {
		flexDirection: 'column',
		width: '50%',
		padding: 8,
	},
	noteThumbnail: {
		width: '100%',
		// height: 170,
		aspectRatio: 1,
		borderRadius: 8,
		backgroundColor: COLORS.container_white,
		alignItems: 'center',
		justifyContent: 'center',
	},
	noteTitle: {
		fontSize: 16,
		fontFamily: 'GmarketSansTTFMedium',
		lineHeight: 20,
		marginTop: 8,
	},
	noteSubInfo: {
		fontSize: 10,
		marginTop: 8,
		fontFamily: 'GmarketSansTTFMedium',
	},
	abnormal: {
		fontSize: 12,
		marginTop: 12,
		fontFamily: 'GmarketSansTTFMedium',
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
		width: 25,
		height: 25,
		borderRadius: 15,
		alignItems: 'center',
		justifyContent: 'center',
	},
	dancer__number: {
		fontSize: 13,
	},
	timeline: {
		width: '100%',
	},
	timeline__scrollPadding: {
		width: width/2,
	},
	timeboxContainer: {
		flexDirection: 'row',
		height: 40,
		// width: musicLength*unitBoxWidth,
		alignItems: 'center',
	},
	formationBox: {
		height: formationBoxHeight,
		marginVertical: 10,
		// borderRadius: 10,
	},
	formationMarker: {
		position: 'absolute',
		height: formationBoxHeight,
		top: 10,
	},
	formationMarker__btn: {
		position: 'absolute',
		top: formationBoxHeight + 10,
		width: 30,
		height: 30,
		borderRadius: 15,
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: COLORS.container_black
	},
	timeMarkerContainer: {
		position: 'absolute',
		// width: '100%',
		height: '100%',
		alignItems: 'center',
		justifyContent: 'flex-start',
		paddingVertical: 6,
		// backgroundColor: 'red'
	},
	timeMarker: {
		width: 80,
		height: 20,
		borderRadius: 10,
		borderWidth: 1,
		borderColor: COLORS.container_white,
		alignItems: 'center',
		justifyContent: 'center',
	},
	timeMarkerLine: {
		width: 1,
		height: '100%',
		backgroundColor: COLORS.container_white,
	},
	addFormationBtn: {
		position: 'absolute',
		top: 70,
		width: 20,
		height: 20,
		alignItems: 'center',
		justifyContent: 'center',
		borderRadius: 15,
		borderWidth: 1,
		borderColor: COLORS.container_white,
		backgroundColor: COLORS.blackMiddle,
		color: COLORS.container_white,
	},
	addFormationBtn__text: {
		fontSize: 15,
	},
	toolBar: {
		width: '100%',
		height: 60,
		alignItems: 'center',
		justifyContent: 'space-between',
		flexDirection: 'row',
	},
	toolBar__tool: {
		width: 40,
		height: 40,
		backgroundColor: COLORS.blackMiddle,
		borderRadius: 5,
		alignItems: 'center',
		justifyContent: 'center',
		// margin: 10,
	},
	itemSeparator: {
		height: 0.5,
		width: '100%',
	},
	dancerList: {
		backgroundColor: COLORS.container_20,
		borderRadius: 4,
		// position: 'relative'
	},
	dancerEntry: {
		flexDirection: 'row',
		// width: '100%',
		alignItems: 'center',
		paddingRight: 4,
	},
	dancerEntry__color: {
		width: 24,
		height: 24,
		borderRadius: 12,
		alignItems: 'center',
		justifyContent: 'center',
		margin: 8,
		shadowColor: COLORS.container_black,
		shadowOffset: { width: 1, height: 1, },
		shadowOpacity: 0.4,
		shadowRadius: 4,
	},
	dancerEntry__text: {
		fontSize: 10,
		color: COLORS.container_white,
	},
	dancerEntry__input: {
		fontSize: 14,
		fontFamily: 'GmarketSansTTFMedium',
		flex: 1,
		color: COLORS.container_white,
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
		shadowColor: COLORS.container_black,
		shadowOffset: { width: 2, height: 2, },
		shadowOpacity: 0.4,
		shadowRadius: 10,
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
		shadowColor: COLORS.container_black,
		shadowOffset: { width: 1, height: 1, },
		shadowOpacity: 0.6,
		shadowRadius: 4,
	},
	// playerBar: {
	// 	width: '100%',
	// 	height: 5,
	// 	alignItems: 'center',
	// 	flexDirection: 'row',
	// },
	// playerBar__timeBox: {
	// 	backgroundColor: COLORS.red,
	// },
	playerBar__time: {
		fontSize: 14,
	},
	playerBar__btn: {
		fontSize: 20
	},
	playerBar__track: {
		width: width,
		height: 8,
		alignItems: 'center',
		flexDirection: 'row',
		// backgroundColor: COLORS.yellow,
	},
	playerBar__trackLeft: {
		height: '100%',
		// width: 50,
	},
	// playerBar__thumb: {
	// 	position: 'absolute',
	// 	left: 0,		// 0 ~ width-140
	// 	width: 20,
	// 	height: 20,
	// 	marginVertical: 10,
	// 	borderRadius: 15,
	// },
	editNote__title: {
		fontFamily: 'GmarketSansTTFMedium',
		fontSize: 12,
		marginTop: 24,
		marginBottom: 12,
	},
	editNote__box: {
		height: 40,
		borderRadius: 4,
		borderColor: COLORS.abnormal,
		backgroundColor: COLORS.container_20,
		paddingHorizontal: 12,
		flexDirection: 'row',
		alignItems: 'center',
	},
	editNote__input: {
		fontSize: 14,
		fontFamily: 'GmarketSansTTFMedium',
		// backgroundColor: COLORS.green,
		flex: 1,
	},
	editNote__flag: {
		width: 8,
		height: 8,
		borderRadius: 4,
		marginHorizontal: 10,
		// marginTop: 20,
		// marginBottom: 5,
	},
	editNote__musicList: {
		position: 'absolute',
		// flex: 1,
		marginTop: 44,
		width: '110%',
		minHeight: 80,
		maxHeight: 380,
		backgroundColor: COLORS.container_10,
		borderRadius: 4,
		// paddingHorizontal: 12,
		// elevation: 100,
		// zIndex: 100,
	},
	editNote__musicEntry: {
		flexDirection: 'row',
		alignItems: 'center',
		// justifyContent: 'space-between',
		height: 40,
		paddingHorizontal: 12,
	},
	editNote__musicText: {

	},
	editNote__text: {
		fontSize: 14,
	},
	editNote__btn: {
		padding: 5,
	}
});

const darkStyleSheet = StyleSheet.create({
	bg: {
		...basicStyleSheet.bg,
		backgroundColor: COLORS.container_black,
	},
	navigationBar: {
		...basicStyleSheet.navigationBar,
		// backgroundColor: COLORS.blackMiddle,
	},
	navigationBar__title: {
		...basicStyleSheet.navigationBar__title,
		color: COLORS.container_white,
	},
	navigationBar__button: {
		...basicStyleSheet.navigationBar__button,
		color: COLORS.container_white,
	},
	navigationBarText: {
		...basicStyleSheet.navigationBarText,
		// color: COLORS.container_white,
	},
	noteList: {
		...basicStyleSheet.noteList,
		// backgroundColor: COLORS.blackLight
	},
	noteEntry: {
		...basicStyleSheet.noteEntry,
	},
	noteTitle: {
		...basicStyleSheet.noteTitle,
		color: COLORS.container_white,
	},
	noteSubInfo: {
		...basicStyleSheet.noteSubInfo,
		color: COLORS.container_40
	},
	noteThumbnail: {
		...basicStyleSheet.noteThumbnail,
	},
	stage: {
		...basicStyleSheet.stage,
		backgroundColor: COLORS.container_white
	},
	stageSelected: {
		...basicStyleSheet.stageSelected,
	},
	stageAxis: {
		...basicStyleSheet.stageAxis
	},
	stageAxisVertical: {
		...basicStyleSheet.stageAxisVertical,
		backgroundColor: COLORS.container_40,
	},
	stageAxisHorizontal: {
		...basicStyleSheet.stageAxisHorizontal,
		backgroundColor: COLORS.container_40,
	},
	dancer: {
		...basicStyleSheet.dancer,
		backgroundColor: COLORS.container_white
	},
	dancer__number: {
		...basicStyleSheet.dancer__number,
		color: COLORS.container_white,
	},
	timeline: {
		...basicStyleSheet.timeline,
	},
	timeline__scrollPadding: {
		...basicStyleSheet.timeline__scrollPadding,
		// backgroundColor: COLORS.blackLight,
	},
	timeboxContainer: {
		...basicStyleSheet.timeboxContainer,
	},
	timeMarkerContainer: {
		...basicStyleSheet.timeMarkerContainer,
	},
	timeMarker: {
		...basicStyleSheet.timeMarker,
	},
	timeMarkerLine: {
		...basicStyleSheet.timeMarkerLine,
	},
	addFormationBtn: {
		...basicStyleSheet.addFormationBtn,
	},
	addFormationBtn__text: {
		...basicStyleSheet.addFormationBtn__text,
		color: COLORS.container_white,
	},
	formationBox: {
		...basicStyleSheet.formationBox,
		backgroundColor: COLORS.container_white,
	},
	formationBoxSelected: {
		...basicStyleSheet.formationBox,
		backgroundColor: COLORS.yellowLight,
	},
	formationMarker: {
		...basicStyleSheet.formationMarker,
		borderColor: COLORS.container_white,
		backgroundColor: COLORS.yellow,
	},
	formationMarker__leftbtn: {
		...basicStyleSheet.formationMarker__btn,
		borderTopRightRadius: 0,
		backgroundColor: COLORS.yellow,
	},
	formationMarker__rightbtn: {
		...basicStyleSheet.formationMarker__btn,
		borderTopLeftRadius: 0,
		backgroundColor: COLORS.yellow,
	},
	toolBar: {
		...basicStyleSheet.toolBar,
		backgroundColor: COLORS.blackLight,
	},
	toolBar__tool: {
		...basicStyleSheet.toolBar__tool,
	},
	toolBar__toolDisabled: {
		...basicStyleSheet.toolBar__tool,
		borderWidth: 1,
		borderColor: COLORS.blackMiddle,
		backgroundColor: '#fff0'
	},
	itemSeparator: {
		...basicStyleSheet.itemSeparator,
		backgroundColor: COLORS.container_30,
	},
	dancerList: {
		...basicStyleSheet.dancerList,
	},
	dancerEntry: {
		...basicStyleSheet.dancerEntry,
	},
	dancerEntry__color: {
		...basicStyleSheet.dancerEntry__color,
	},
	dancerEntry__text: {
		...basicStyleSheet.dancerEntry__text,
		color: COLORS.container_white,
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
		backgroundColor: COLORS.container_black
	},
	dancerAddBtn: {
		...basicStyleSheet.dancerAddBtn,
		// backgroundColor: COLORS.red
	},
	// playerBar: {
	// 	...basicStyleSheet.playerBar,
	// 	backgroundColor: COLORS.container_black
	// },
	// playerBar__timeBox: {
	// 	...basicStyleSheet.playerBar__timeBox,
	// },
	playerBar__time: {
		...basicStyleSheet.playerBar__time,
		color: COLORS.container_white,
	},
	playerBar__btn: {
		...basicStyleSheet.playerBar__btn,
		color: COLORS.container_white,
	},
	playerBar__track: {
		...basicStyleSheet.playerBar__track,
		backgroundColor: COLORS.container_black,
	},
	playerBar__trackLeft: {
		...basicStyleSheet.playerBar__trackLeft,
		backgroundColor: COLORS.container_white,
	},
	// playerBar__trackBgRight: {
	// 	...basicStyleSheet.playerBar__trackBg,
	// 	backgroundColor: COLORS.container_black,
	// },
	// playerBar__thumb: {
	// 	...basicStyleSheet.playerBar__thumb,
	// 	backgroundColor: COLORS.container_white,
	// },
	editNote__title: {
		...basicStyleSheet.editNote__title,
		color: COLORS.container_30,
	},
	editNote__box: {
		...basicStyleSheet.editNote__box,
	},
	editNote__input: {
		...basicStyleSheet.editNote__input,
		color: COLORS.container_white,
	},
	editNote__flag: {
		...basicStyleSheet.editNote__flag,
		backgroundColor: COLORS.green
	},
	editNote__musicList: {
		...basicStyleSheet.editNote__musicList,
	},
	editNote__musicEntry: {
		...basicStyleSheet.editNote__musicEntry,
	},
	editNote__btn: {
		...basicStyleSheet.editNote__btn,
		color: COLORS.container_30,
	}
});

const lightStyleSheet = StyleSheet.create({
	toolbar: {
		width:'100%', 
		height: 40, 
		flexDirection: 'row', 
		backgroundColor:COLORS.purple, 
		alignItems: 'center', 
		justifyContent: 'space-between', 
	}
});

const dbStyleSheet = StyleSheet.create({
	bg: {
		...basicStyleSheet.bg,
		backgroundColor: COLORS.container_black,
	},
	toolbar: {
		...basicStyleSheet.toolbar,
		backgroundColor: COLORS.blackLight,
	},
	toolbarTitle: {
		...basicStyleSheet.toolbarTitle,
		color: COLORS.container_white,
	},
	toolbarButton: {
		...basicStyleSheet.toolbarButton,
		color: COLORS.container_white,
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
		color: COLORS.container_white,
	},
	noteSubInfo: {
		...basicStyleSheet.noteSubInfo,
		color: COLORS.container_40
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