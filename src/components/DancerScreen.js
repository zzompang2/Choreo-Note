import React, { useEffect, useRef, useState } from 'react';
import {
	View, Text, TouchableOpacity, FlatList, TextInput, Animated, Switch, Alert
} from 'react-native';
import Cancel from '../assets/icons/Large(32)/Cancel';
import Minus from '../assets/icons/Medium(24)/Minus';
import getStyleSheet, { COLORS, getDancerColors } from '../values/styles';

const TAG = "DancerScreen/";
const styles = getStyleSheet();
const dancerColors = getDancerColors();

const useConstructor = (callBack = () => {}) => {
  const hasBeenCalled = useRef(false);
	console.log(TAG, 'myConstructor:', hasBeenCalled.current);
  if (hasBeenCalled.current) return;
  callBack();
  hasBeenCalled.current = true;
}

export default function DancerScreen({
	dancers, addDancer, deleteDancer,
	displayName, changeName, changeColor, setDancerScreen
}) {
	useConstructor(() => {
		this.btnWidth = new Animated.Value(70);
		this.btnScale = new Animated.Value(0);
		this.screenTop = new Animated.Value(1);
	});

	const [isAddBtnAppear, setIsAddBtnAppear] = useState(false);

	const addBtnContainerStyle = { width: this.btnWidth };
	const addBtnStyle = { transform: [{ scale: this.btnScale }]};
	const screenTopStyle = { top: this.screenTop.interpolate({
		inputRange: [0, 1],
		outputRange: ['0%', '100%']
	})};

	controlAddButton = () => {
		console.log(TAG, 'controlAddButton:', isAddBtnAppear);
		if(!isAddBtnAppear) {
			Animated.spring(
				this.btnWidth, {
					toValue: 330,
					friction: 5,
					tension: 100,
					useNativeDriver: false
			}).start();
			Animated.timing(
				this.btnScale, {
					toValue: 1,
					duration: 700,
					delay: 200,
					useNativeDriver: true
				}
			).start();
		}

		else {
			Animated.timing(
				this.btnScale, {
					toValue: 0,
					duration: 1,
					useNativeDriver: true
				}
			).start();
			Animated.spring(
				this.btnWidth, {
					toValue: 70,
					friction: 10,
					tension: 70,
					useNativeDriver: false
			}).start();
		}

		setIsAddBtnAppear((cur) => !cur);
	}

	myAddDancer = (colorIdx) => {
		addDancer(colorIdx);
	}

	myDeleteDancer = (did) => {
		Alert.alert("댄서 삭제", (did+1)+"번째 댄서를 정말 삭제하시겠어요?",
		[{text: "아니요", style: 'cancel'}, {
			text: "네, 삭제할게요", style: 'destructive',
			onPress: () => deleteDancer(did)
		}]);
	}

	// <FlatList> 구분선
	listViewItemSeparator = () => 
	<View style={getStyleSheet().itemSeparator} />
	
	useEffect(() => {
		Animated.timing(
			this.screenTop, {
				toValue: 0,
				duration: 500,
				useNativeDriver: false,
			}
		).start();
	}, []);

	return(
		<View style={{position: 'absolute', width: '100%', height: '100%', justifyContent: 'flex-end'}}>
			<Animated.View style={[screenTopStyle, {flex: 1, backgroundColor: COLORS.container_black}]}>
				{/* Navigation Bar */}
				<View style={[styles.navigationBar, {borderTopLeftRadius: 30, borderTopRightRadius: 30}]}>
					<View style={{flexDirection: 'row', alignItems: 'center'}}>
						<TouchableOpacity
						style={{ width: 50, height: 50, alignItems: 'center', justifyContent: 'center' }}
						onPress={() =>
							Animated.timing(
								this.screenTop, {
									toValue: 1,
									duration: 250,
									useNativeDriver: false,
								}
							).start(() => setDancerScreen(false))}>
								<Cancel />
						</TouchableOpacity>
						<Text style={styles.navigationBar__title}>댄서 편집</Text>
					</View>
				</View>

				{listViewItemSeparator()}

				{/* Dancer 리스트 */}
				<FlatList
				initialNumToRender={15}
				style={styles.noteList}
				data={dancers}
				keyExtractor={(item, idx) => idx.toString()}
				// ItemSeparatorComponent={listViewItemSeparator}
				renderItem={({ item, index }) =>
				<View>
					<View style={styles.dancerEntry}>
						<TouchableOpacity
						activeOpacity={1}
						onPress={() => changeColor(item.did)}
						style={{...styles.dancerEntry__color, backgroundColor: dancerColors[item.color]}}>
							<Text style={styles.dancerEntry__text}>
								{displayName ? item.name.slice(0, 2) : item.did+1}
							</Text>
						</TouchableOpacity>
						<TextInput
						maxLength={30}
						style={{...styles.dancerEntry__input}}
						maxLength={30}
						placeholder="이름없는 댄서"
						placeholderTextColor={COLORS.container_40}
						onEndEditing={e => changeName(e.nativeEvent.text, item.did)}
						autoCorrect={false}>
							{item.name}
						</TextInput>
						<TouchableOpacity
						onPress={() => myDeleteDancer(item.did)}
						style={{width: 32, height: 32, alignItems: 'center', justifyContent: 'center'}}>
							<Minus />
						</TouchableOpacity>
					</View>
					{/* 맨 마지막 entry 에만 여백 공간을 둔다. 버튼에 가려지지 않게 하기 위해 */}
					{index == dancers.length-1 ? <View style={{height: 120}} /> : null}
				</View>
				} />

				{/* Add 버튼 */}
				<View>
					<Animated.View style={[styles.dancerAddBtnContainer, addBtnContainerStyle]}>
						{dancerColors.map((color, idx) => 
						<TouchableOpacity 
						key={idx}
						style={[styles.dancerAddBtn, {backgroundColor: color}, addBtnStyle]}
						onPress={() => myAddDancer(idx)}/>)}
						<TouchableOpacity
						style={styles.dancerControlBtn}
						onPress={controlAddButton} />
					</Animated.View>
				</View>
			</Animated.View>
		</View>
	)
}