import { StyleSheet } from 'react-native';

export const COLORS = {
  white: '#F9F9F9',
  blackDark: '#191A1E',
	blackDarkTransparent: '#191A1Edd',
	blackLight: '#303030',
  grayDark: '#777777',
  grayMiddle: '#AFAFAF',
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