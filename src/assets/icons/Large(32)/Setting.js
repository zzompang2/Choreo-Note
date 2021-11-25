import * as React from "react"
import Svg, { Path, Rect } from "react-native-svg"

export default function Setting({ color }) {
  return (
    <Svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <Path d="M27.7812 11.9505H25.4738C25.1627 11.9508 24.857 11.8691 24.5875 11.7138C24.318 11.5585 24.0942 11.3349 23.9385 11.0656C23.7829 10.7963 23.7009 10.4907 23.7008 10.1796C23.7007 9.86857 23.7826 9.56298 23.9381 9.29359L25.0919 7.29484C25.2418 7.01953 25.2798 6.69706 25.1981 6.39443C25.1164 6.09181 24.9212 5.8323 24.6531 5.66984L20.3469 3.19172C20.072 3.03978 19.7489 3.00061 19.4456 3.08248C19.1424 3.16435 18.8829 3.36084 18.7219 3.63047L17.5681 5.63734C17.4112 5.90534 17.187 6.12761 16.9176 6.28208C16.6482 6.43654 16.343 6.51781 16.0325 6.51781C15.722 6.51781 15.4168 6.43654 15.1474 6.28208C14.878 6.12761 14.6538 5.90534 14.4969 5.63734L13.3106 3.58984C13.1496 3.32021 12.8901 3.12372 12.5868 3.04185C12.2836 2.95999 11.9605 2.99916 11.6856 3.15109L7.37937 5.62922C7.1113 5.79168 6.91613 6.05119 6.83442 6.35381C6.75272 6.65643 6.79075 6.97891 6.94062 7.25422L8.09438 9.25297C8.26191 9.52564 8.35243 9.83861 8.35633 10.1586C8.36023 10.4786 8.27736 10.7937 8.11652 11.0704C7.95568 11.3471 7.72289 11.575 7.44288 11.73C7.16287 11.8849 6.8461 11.9611 6.52625 11.9505H4.21875C3.89692 11.9505 3.58815 12.0777 3.35982 12.3046C3.1315 12.5314 3.00215 12.8393 3 13.1611V18.1336C3.00215 18.4554 3.1315 18.7633 3.35982 18.9901C3.58815 19.2169 3.89692 19.3442 4.21875 19.3442H6.52625C6.83731 19.3439 7.14297 19.4256 7.41246 19.5809C7.68196 19.7362 7.9058 19.9598 8.06146 20.2291C8.21711 20.4984 8.2991 20.804 8.29918 21.115C8.29925 21.4261 8.21741 21.7317 8.06187 22.0011L6.90813 24.008C6.75619 24.2828 6.71702 24.606 6.79889 24.9092C6.88075 25.2124 7.07725 25.4719 7.34687 25.633L11.6531 28.1192C11.9294 28.2684 12.2526 28.3052 12.5553 28.2219C12.858 28.1387 13.117 27.9418 13.2781 27.6723L14.4319 25.6736C14.5871 25.4035 14.8108 25.1792 15.0804 25.0232C15.35 24.8672 15.656 24.7851 15.9675 24.7851C16.279 24.7851 16.585 24.8672 16.8546 25.0232C17.1242 25.1792 17.3479 25.4035 17.5031 25.6736L18.6569 27.6723C18.818 27.9418 19.077 28.1387 19.3797 28.2219C19.6824 28.3052 20.0056 28.2684 20.2819 28.1192L24.5881 25.633C24.8578 25.4719 25.0542 25.2124 25.1361 24.9092C25.218 24.606 25.1788 24.2828 25.0269 24.008L23.8731 22.0011C23.7176 21.7317 23.6357 21.4261 23.6358 21.115C23.6359 20.804 23.7179 20.4984 23.8735 20.2291C24.0292 19.9598 24.253 19.7362 24.5225 19.5809C24.792 19.4256 25.0977 19.3439 25.4088 19.3442H27.7812C28.1031 19.3442 28.4118 19.2169 28.6402 18.9901C28.8685 18.7633 28.9979 18.4554 29 18.1336V13.1611C28.9979 12.8393 28.8685 12.5314 28.6402 12.3046C28.4118 12.0777 28.1031 11.9505 27.7812 11.9505V11.9505Z" fill={color}/>
    <Path d="M15.9999 20.7821C18.8314 20.7821 21.1268 18.4867 21.1268 15.6552C21.1268 12.8237 18.8314 10.5283 15.9999 10.5283C13.1684 10.5283 10.873 12.8237 10.873 15.6552C10.873 18.4867 13.1684 20.7821 15.9999 20.7821Z" fill="black"/>
    <Path d="M25.8536 0.853552C25.5386 0.53857 25.7617 0 26.2071 0H31C31.5523 0 32 0.447715 32 1V5.79289C32 6.23835 31.4614 6.46143 31.1464 6.14645L25.8536 0.853552Z" fill={color}/>
    </Svg>
  )
}
