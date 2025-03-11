import { createRoot } from 'react-dom/client';
import { App } from './App';
import './css/chats.css';
import './css/index.css';
import './css/loading.css';
import './css/NitroCardView.css';
import './css/NotificationCenterView.css';
import './css/PurseView.css';

import './css/room/ChatHistoryView.css';
import './css/room/RoomWidgets.css';

import './css/widgets/FurnitureWidgets.css';

createRoot(document.getElementById('root')).render(<App />);
