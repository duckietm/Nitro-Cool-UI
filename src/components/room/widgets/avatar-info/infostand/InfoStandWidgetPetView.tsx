import { CreateLinkEvent, PetRespectComposer, PetType } from '@nitrots/nitro-renderer';
import { FC, useEffect, useState, useCallback } from 'react';
import { FaTimes } from 'react-icons/fa';
import { AvatarInfoPet, ConvertSeconds, GetConfigurationValue, LocalizeText, SendMessageComposer } from '../../../../../api';
import { Button, Column, Flex, LayoutCounterTimeView, LayoutPetImageView, LayoutRarityLevelView, Text, UserProfileIconView } from '../../../../../common';
import { useRoom, useSessionInfo } from '../../../../../hooks';

// TypeScript interface for AvatarInfoPet
interface AvatarInfoPet {
  id: number;
  name: string;
  petType: number;
  petBreed: number;
  petFigure: string;
  posture: string;
  level: number;
  maximumLevel: number;
  age: number;
  ownerId: number;
  ownerName: string;
  respect: number;
  dead?: boolean;
  energy?: number;
  maximumEnergy?: number;
  happyness?: number;
  maximumHappyness?: number;
  experience?: number;
  levelExperienceGoal?: number;
  remainingGrowTime?: number;
  remainingTimeToLive?: number;
  maximumTimeToLive?: number;
  rarityLevel?: number;
  isOwner?: boolean;
}

interface InfoStandWidgetPetViewProps {
  avatarInfo: AvatarInfoPet;
  onClose: () => void;
}

const PetHeader: FC<{ name: string; petType: number; petBreed: number; onClose: () => void }> = ({ name, petType, petBreed, onClose }) => (
  <div className="flex flex-col gap-1">
    <Flex alignItems="center" gap={1} justifyContent="between">
      <Text small wrap variant="white">
        {name}
      </Text>
      <FaTimes
        className="cursor-pointer fa-icon"
        onClick={onClose}
        aria-label={LocalizeText('generic.close')}
        title={LocalizeText('generic.close')}
      />
    </Flex>
    <Text small wrap variant="white">
      {LocalizeText(`pet.breed.${petType}.${petBreed}`)}
    </Text>
    <hr className="m-0" />
  </div>
);

const MonsterplantStats: FC<{
  avatarInfo: AvatarInfoPet;
  remainingGrowTime: number;
  remainingTimeToLive: number;
}> = ({ avatarInfo, remainingGrowTime, remainingTimeToLive }) => (
  <>
    <Column center gap={1}>
      <LayoutPetImageView direction={4} figure={avatarInfo.petFigure} posture={avatarInfo.posture} />
      <hr className="m-0" />
    </Column>
    <div className="flex flex-col gap-2">
      {!avatarInfo.dead && (
        <Column alignItems="center" gap={1}>
          <Text center small wrap variant="white">
            {LocalizeText('pet.level', ['level', 'maxlevel'], [avatarInfo.level.toString(), avatarInfo.maximumLevel.toString()])}
          </Text>
        </Column>
      )}
      <Column alignItems="center" gap={1}>
        <Text small truncate variant="white">
          {LocalizeText('infostand.pet.text.wellbeing')}
        </Text>
        <div className="bg-light-dark rounded relative overflow-hidden w-full">
          <div className="flex justify-center items-center size-full absolute">
            <Text small variant="white">
              {avatarInfo.dead || remainingTimeToLive <= 0
                ? '00:00:00'
                : `${ConvertSeconds(remainingTimeToLive).split(':')[1]}:${ConvertSeconds(remainingTimeToLive).split(':')[2]}:${ConvertSeconds(remainingTimeToLive).split(':')[3]}`}
            </Text>
          </div>
          <div
            className="bg-success rounded pet-stats"
            style={{
              width: avatarInfo.dead || remainingTimeToLive <= 0 ? '0' : `${(remainingTimeToLive / avatarInfo.maximumTimeToLive) * 100}%`,
            }}
          />
        </div>
      </Column>
      {remainingGrowTime > 0 && (
        <Column alignItems="center" gap={1}>
          <Text small truncate variant="white">
            {LocalizeText('infostand.pet.text.growth')}
          </Text>
          <LayoutCounterTimeView
            className="top-2 end-2"
            day={ConvertSeconds(remainingGrowTime).split(':')[0]}
            hour={ConvertSeconds(remainingGrowTime).split(':')[1]}
            minutes={ConvertSeconds(remainingGrowTime).split(':')[2]}
            seconds={ConvertSeconds(remainingGrowTime).split(':')[3]}
          />
        </Column>
      )}
      <Column alignItems="center" gap={1}>
        <Text small truncate variant="white">
          {LocalizeText('infostand.pet.text.raritylevel', ['level'], [LocalizeText(`infostand.pet.raritylevel.${avatarInfo.rarityLevel}`)])}
        </Text>
        <LayoutRarityLevelView className="top-2 end-2" level={avatarInfo.rarityLevel} />
      </Column>
      <hr className="m-0" />
    </div>
    <div className="flex flex-col gap-1">
      <Text small wrap variant="white">
        {LocalizeText('pet.age', ['age'], [avatarInfo.age.toString()])}
      </Text>
      <hr className="m-0" />
    </div>
  </>
);

// Sub-component: Regular Pet Stats
const RegularPetStats: FC<{ avatarInfo: AvatarInfoPet }> = ({ avatarInfo }) => (
  <>
    <div className="flex flex-col gap-1">
      <div className="flex gap-1">
        <Column fullWidth className="body-image pet p-1" overflow="hidden">
          <LayoutPetImageView direction={4} figure={avatarInfo.petFigure} posture={avatarInfo.posture} />
        </Column>
        <Column grow gap={1}>
          <Text center small wrap variant="white">
            {LocalizeText('pet.level', ['level', 'maxlevel'], [avatarInfo.level.toString(), avatarInfo.maximumLevel.toString()])}
          </Text>
          <Column alignItems="center" gap={1}>
            <Text small truncate variant="white">
              {LocalizeText('infostand.pet.text.happiness')}
            </Text>
            <div className="bg-light-dark rounded relative overflow-hidden w-full">
              <div className="flex justify-center items-center size-full absolute">
                <Text small variant="white">
                  {avatarInfo.happyness + '/' + avatarInfo.maximumHappyness}
                </Text>
              </div>
              <div
                className="bg-info rounded pet-stats"
                style={{ width: (avatarInfo.happyness / avatarInfo.maximumHappyness) * 100 + '%' }}
              />
            </div>
          </Column>
          <Column alignItems="center" gap={1}>
            <Text small truncate variant="white">
              {LocalizeText('infostand.pet.text.experience')}
            </Text>
            <div className="bg-light-dark rounded relative overflow-hidden w-full">
              <div className="flex justify-center items-center size-full absolute">
                <Text small variant="white">
                  {avatarInfo.experience + '/' + avatarInfo.levelExperienceGoal}
                </Text>
              </div>
              <div
                className="bg-purple rounded pet-stats"
                style={{ width: (avatarInfo.experience / avatarInfo.levelExperienceGoal) * 100 + '%' }}
              />
            </div>
          </Column>
          <Column alignItems="center" gap={1}>
            <Text small truncate variant="white">
              {LocalizeText('infostand.pet.text.energy')}
            </Text>
            <div className="bg-light-dark rounded relative overflow-hidden w-full">
              <div className="flex justify-center items-center size-full absolute">
                <Text small variant="white">
                  {avatarInfo.energy + '/' + avatarInfo.maximumEnergy}
                </Text>
              </div>
              <div
                className="bg-success rounded pet-stats"
                style={{ width: (avatarInfo.energy / avatarInfo.maximumEnergy) * 100 + '%' }}
              />
            </div>
          </Column>
        </Column>
      </div>
      <hr className="m-0" />
    </div>
    <div className="flex flex-col gap-1">
      <Text small wrap variant="white">
        {LocalizeText('infostand.text.petrespect', ['count'], [avatarInfo.respect.toString()])}
      </Text>
      <Text small wrap variant="white">
        {LocalizeText('pet.age', ['age'], [avatarInfo.age.toString()])}
      </Text>
      <hr className="m-0" />
    </div>
  </>
);

export const InfoStandWidgetPetView: FC<InfoStandWidgetPetViewProps> = ({ avatarInfo, onClose }) => {
  const [remainingGrowTime, setRemainingGrowTime] = useState(0);
  const [remainingTimeToLive, setRemainingTimeToLive] = useState(0);
  const { roomSession = null } = useRoom();
  const { petRespectRemaining = 0, respectPet = null } = useSessionInfo();

  useEffect(() => {
    setRemainingGrowTime(avatarInfo.remainingGrowTime || 0);
    setRemainingTimeToLive(avatarInfo.remainingTimeToLive || 0);
  }, [avatarInfo]);

  useEffect(() => {
    if (avatarInfo.petType !== PetType.MONSTERPLANT || avatarInfo.dead) return;

    const interval = setInterval(() => {
      setRemainingGrowTime((prev) => (prev <= 0 ? 0 : prev - 1));
      setRemainingTimeToLive((prev) => (prev <= 0 ? 0 : prev - 1));
    }, 1000);

    return () => clearInterval(interval);
  }, [avatarInfo]);

  const processButtonAction = useCallback(
    async (action: string) => {
      try {
        let hideMenu = true;
        if (!action) return;

        switch (action) {
          case 'respect':
            await respectPet(avatarInfo.id);
            if (petRespectRemaining - 1 >= 1) hideMenu = false;
            break;
          case 'buyfood':
            CreateLinkEvent('catalog/open/' + GetConfigurationValue('catalog.links')['pets.buy_food']);
            break;
          case 'train':
            roomSession?.requestPetCommands(avatarInfo.id);
            break;
          case 'treat':
            SendMessageComposer(new PetRespectComposer(avatarInfo.id));
            break;
          case 'compost':
            roomSession?.compostPlant(avatarInfo.id);
            break;
          case 'pick_up':
            roomSession?.pickupPet(avatarInfo.id);
            break;
        }

        if (hideMenu) onClose();
      } catch (error) {
        console.error(`Failed to process action ${action}:`, error);
      }
    },
    [avatarInfo, petRespectRemaining, respectPet, roomSession, onClose]
  );

  const buttons = [
    {
      action: 'buyfood',
      label: LocalizeText('infostand.button.buyfood'),
      condition: avatarInfo.petType !== PetType.MONSTERPLANT,
    },
    {
      action: 'train',
      label: LocalizeText('infostand.button.train'),
      condition: avatarInfo.isOwner && avatarInfo.petType !== PetType.MONSTERPLANT,
    },
    {
      action: 'treat',
      label: LocalizeText('infostand.button.pettreat'),
      condition:
        !avatarInfo.dead &&
        avatarInfo.petType === PetType.MONSTERPLANT &&
        avatarInfo.energy / avatarInfo.maximumEnergy < 0.98,
    },
    {
      action: 'compost',
      label: LocalizeText('infostand.button.compost'),
      condition: roomSession?.isRoomOwner && avatarInfo.petType === PetType.MONSTERPLANT,
    },
    {
      action: 'pick_up',
      label: LocalizeText('inventory.pets.pickup'),
      condition: avatarInfo.isOwner,
    },
    {
      action: 'respect',
      label: LocalizeText('infostand.button.petrespect', ['count'], [petRespectRemaining.toString()]),
      condition: petRespectRemaining > 0 && avatarInfo.petType !== PetType.MONSTERPLANT,
    },
  ];

  if (!avatarInfo) return <Text variant="white">{LocalizeText('generic.loading')}</Text>;

  return (
    <Column alignItems="end" gap={1}>
      <Column className="nitro-infostand rounded">
        <Column className="container-fluid content-area" gap={1} overflow="visible">
          <PetHeader
            name={avatarInfo.name}
            petType={avatarInfo.petType}
            petBreed={avatarInfo.petBreed}
            onClose={onClose}
          />
          {avatarInfo.petType === PetType.MONSTERPLANT ? (
            <MonsterplantStats
              avatarInfo={avatarInfo}
              remainingGrowTime={remainingGrowTime}
              remainingTimeToLive={remainingTimeToLive}
            />
          ) : (
            <RegularPetStats avatarInfo={avatarInfo} />
          )}
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1">
              <UserProfileIconView userId={avatarInfo.ownerId} />
              <Text small wrap variant="white">
                {LocalizeText('infostand.text.petowner', ['name'], [avatarInfo.ownerName])}
              </Text>
            </div>
          </div>
        </Column>
      </Column>
      <Flex gap={1} justifyContent="end">
        {buttons.map(
          (button) =>
            button.condition && (
              <Button key={button.action} variant="dark" onClick={() => processButtonAction(button.action)}>
                {button.label}
              </Button>
            )
        )}
      </Flex>
    </Column>
  );
};