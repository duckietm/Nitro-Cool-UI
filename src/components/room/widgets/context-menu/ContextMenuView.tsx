import { GetStage, GetTicker, NitroRectangle, NitroTicker, RoomObjectType } from '@nitrots/nitro-renderer';
import { CSSProperties, FC, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { FixedSizeStack, GetRoomObjectBounds, GetRoomObjectScreenLocation, GetRoomSession } from '../../../../api';
import { BaseProps } from '../../../../common';
import { ContextMenuCaretView } from './ContextMenuCaretView';

interface ContextMenuViewProps extends BaseProps<HTMLDivElement> {
  objectId: number;
  category: number;
  userType?: number;
  fades?: boolean;
  onClose: () => void;
  collapsable?: boolean;
}

const LOCATION_STACK_SIZE = 25;
const BUBBLE_DROP_SPEED = 3;
const FADE_DELAY = 5000;
const FADE_LENGTH = 75;
const SPACE_AROUND_EDGES = 10;

export const ContextMenuView: FC<ContextMenuViewProps> = ({
  objectId = -1,
  category = -1,
  userType = -1,
  fades = false,
  onClose,
  classNames = [],
  style = {},
  children = null,
  collapsable = false,
  ...rest
}) => {
  const [pos, setPos] = useState<{ x: number; y: number }>({ x: null, y: null });
  const [opacity, setOpacity] = useState(1);
  const [isFading, setIsFading] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);
  const stackRef = useRef<FixedSizeStack>(new FixedSizeStack(LOCATION_STACK_SIZE));
  const maxStackRef = useRef(-1000000);

  const updatePosition = useCallback(
    (bounds: NitroRectangle, location: { x: number; y: number }) => {
      if (!bounds || !location || !elementRef.current) return;

      let offset = -elementRef.current.offsetHeight;
      if (userType > -1 && [RoomObjectType.USER, RoomObjectType.BOT, RoomObjectType.RENTABLE_BOT].includes(userType)) {
        offset += bounds.height > 50 ? 15 : 0;
      } else {
        offset -= 14;
      }

      stackRef.current.addValue(location.y - bounds.top);
      let maxStack = stackRef.current.getMax();
      if (maxStack < maxStackRef.current - BUBBLE_DROP_SPEED) {
        maxStack = maxStackRef.current - BUBBLE_DROP_SPEED;
      }
      maxStackRef.current = maxStack;

      const deltaY = location.y - maxStack;
      let x = Math.round(location.x - elementRef.current.offsetWidth / 2);
      let y = Math.round(deltaY + offset);

      const stage = GetStage();
      const maxLeft = stage.width - elementRef.current.offsetWidth - SPACE_AROUND_EDGES;
      const maxTop = stage.height - elementRef.current.offsetHeight - SPACE_AROUND_EDGES;

      x = Math.max(SPACE_AROUND_EDGES, Math.min(x, maxLeft));
      y = Math.max(SPACE_AROUND_EDGES, Math.min(y, maxTop));

      setPos({ x, y });
    },
    [userType]
  );

  const getClassNames = useMemo(() => {
    const classes = [
      '!p-[2px]',
      'bg-[#1c323f]',
      'border-[2px]',
      'border-[solid]',
      'border-[rgba(255,255,255,.5)]',
      'rounded-[.25rem]',
      'text-[.7875rem]',
	  'text-white',
      'z-40',
      'pointer-events-auto',
      'absolute',
      pos.x !== null ? 'visible' : 'invisible',
    ];
    if (isCollapsed) classes.push('menu-hidden');
    return [...classes, ...classNames];
  }, [pos.x, isCollapsed, classNames]);

  const getStyle = useMemo(
    () => ({
      left: pos.x ?? 0,
      top: pos.y ?? 0,
      transition: isFading ? 'opacity 75ms linear' : undefined,
      opacity,
      ...style,
    }),
    [pos, opacity, isFading, style]
  );

  useEffect(() => {
    if (!elementRef.current) return;

    const update = () => {
      if (!elementRef.current) return;
      const bounds = GetRoomObjectBounds(GetRoomSession().roomId, objectId, category);
      const location = GetRoomObjectScreenLocation(GetRoomSession().roomId, objectId, category);
      updatePosition(bounds, location);
    };

    const ticker = GetTicker();
    ticker.add(update);

    return () => ticker.remove(update);
  }, [objectId, category, updatePosition]);

  useEffect(() => {
    if (!fades) return;

    const timeout = setTimeout(() => {
      setIsFading(true);
      setTimeout(onClose, FADE_LENGTH);
    }, FADE_DELAY);

    return () => clearTimeout(timeout);
  }, [fades, onClose]);

  useEffect(() => {
    if (!isFading) return;
    setOpacity(0);
  }, [isFading]);

  return (
    <div ref={elementRef} className={getClassNames.join(' ')} style={getStyle} {...rest}>
      {!(collapsable && isCollapsed) && children}
      {collapsable && <ContextMenuCaretView collapsed={isCollapsed} onClick={() => setIsCollapsed((prev) => !prev)} />}
    </div>
  );
};