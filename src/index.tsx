import { createRoot } from 'react-dom/client';
import { App } from './App';

import './css/index.css';

import './css/chat/chats.css';

import './css/floorplan/FloorplanEditorView.css';

import './css/hotelview/HotelView.css';

import './css/icons/icons.css';

import './css/loading/loading.css';

import './css/nitrocard/NitroCardView.css';

import './css/notification/NotificationCenterView.css';

import './css/purse/PurseView.css';

import './css/room/ChatHistoryView.css';
import './css/room/RoomWidgets.css';

import './css/slider.css';

import './css/widgets/FurnitureWidgets.css';

createRoot(document.getElementById('root')).render(<App />);
