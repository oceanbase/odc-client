import { listRiskLevels } from '@/common/network/riskLevel';
import { IRiskLevel } from '@/d.ts/riskLevel';
import { inject, observer } from 'mobx-react';
import { useEffect, useState, useRef } from 'react';
import SecureLayout from '../components/SecureLayout';
import SecureSider, { SiderItem } from '../components/SecureSider';
import { RiskLevelMap } from '../interface';
import InnerRiskLevel from './components/InnerRiskLevel';
import { Spin } from 'antd';

function genRiskLevel(
  riskLevel: IRiskLevel,
): {
  label: string;
  value: number;
  origin: IRiskLevel;
} {
  return {
    label: RiskLevelMap[riskLevel?.level],
    value: riskLevel?.level,
    origin: riskLevel,
  };
}

const RiskLevel = ({ userStore }) => {
  const currentSiderItemRef = useRef<{ value: number; origin: IRiskLevel; label: string }>(null);
  const [selectedItem, setSelectedItem] = useState<number>();
  const [siderItemList, setSiderItemList] = useState<SiderItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [currentRiskLevel, setCurrentRiskLevel] = useState<IRiskLevel>();

  const initRiskLevel = async () => {
    const riskLevels = await listRiskLevels();
    const newSiderItemList = riskLevels?.map(genRiskLevel)?.sort((a, b) => b?.value - a?.value);
    newSiderItemList?.length > 0 && setSiderItemList(newSiderItemList);
    newSiderItemList?.length > 0 && handleItemClick(newSiderItemList?.[0]);
  };

  const handleItemClick = (item: { value: number; origin: IRiskLevel; label: string }) => {
    setSelectedItem(item?.value);
    setCurrentRiskLevel(item?.origin);
    currentSiderItemRef.current = item;
  };
  const memoryReload = async () => {
    const riskLevels = await listRiskLevels();
    const newSiderItemList = riskLevels?.map(genRiskLevel)?.sort((a, b) => b?.value - a?.value);
    newSiderItemList?.length > 0 && setSiderItemList(newSiderItemList);
    newSiderItemList?.length > 0 && setSelectedItem(currentSiderItemRef.current?.value);
    const newCrrentRiskLevel = riskLevels?.find(
      (riskLevel) => riskLevel?.id === currentSiderItemRef.current?.origin?.id,
    );
    newCrrentRiskLevel && setCurrentRiskLevel(newCrrentRiskLevel);
  };
  useEffect(() => {
    setLoading(true);
    initRiskLevel();
    setLoading(false);
  }, []);
  return (
    <SecureLayout>
      <SecureSider
        siderItemList={siderItemList}
        selectedItem={selectedItem}
        handleItemClick={handleItemClick}
      />
      <Spin spinning={loading}>
        <InnerRiskLevel
          key={currentRiskLevel?.id}
          currentRiskLevel={currentRiskLevel}
          memoryReload={memoryReload}
        />
      </Spin>
    </SecureLayout>
  );
};

export default inject('userStore')(observer(RiskLevel));
