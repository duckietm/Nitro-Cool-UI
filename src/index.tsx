import { createRoot } from 'react-dom/client';
import { App } from './App';

import './css/index.css';
import './css/NitroCardView.css';
import './css/PurseView.css';

import './css/chat/chats.css';

import './css/loading/loading.css';

import './css/notification/NotificationCenterView.css';

import './css/room/ChatHistoryView.css';
import './css/room/RoomWidgets.css';

import './css/widgets/FurnitureWidgets.css';

createRoot(document.getElementById('root')).render(<App />);
