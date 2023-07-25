import { listRiskDetectRules } from '@/common/network/riskDetectRule';
import { listRiskLevels } from '@/common/network/riskLevel';
import { IRiskDetectRule } from '@/d.ts/riskDetectRule';
import { IRiskLevel } from '@/d.ts/riskLevel';
import { UserStore } from '@/store/login';
import { inject, observer } from 'mobx-react';
import { useEffect, useState } from 'react';
import SecureLayout from '../components/SecureLayout';
import SecureSider, { SiderItem } from '../components/SecureSider';
import { ITableLoadOptions } from '../components/SecureTable/interface';
import { RiskLevelMap } from '../interface';
import InnerRiskDetectRules from './components/InnerRiskDetectRules';
import { RiskLevelMapProps } from './interface';

export function getRuleDecetedList(riskLevel: IRiskLevel): RiskLevelMapProps {
  return {
    value: riskLevel.id,
    level: riskLevel.level,
    label: RiskLevelMap[riskLevel.level],
    organizationId: riskLevel.organizationId,
    name: riskLevel.name,
    style: riskLevel.style,
  };
}

const RiskDetectRules: React.FC<{
  userStore: UserStore;
}> = ({ userStore }) => {
  const [siderLoading, setSiderLoading] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [riskDetectRules, setRiskDetectRules] = useState<IRiskDetectRule[]>([]);
  const [siderItemList, setSiderItemList] = useState<SiderItem[]>([]);

  const [selectedItem, setSelectedItem] = useState<number>(0);
  const [riskLevel, setRiskLevel] = useState<RiskLevelMapProps>();

  const getListRiskDetectRules = async (item) => {
    setLoading(true);
    const rawData = await listRiskDetectRules({
      riskLevelId: item.value,
    });
    setRiskDetectRules(rawData);
    setLoading(false);
  };

  const exSearch = async (args: ITableLoadOptions) => {
    const { searchValue } = args ?? {};
    if (riskLevel?.value) {
      setLoading(true);
      const rawData = await listRiskDetectRules({
        riskLevelId: riskLevel?.value,
        name: searchValue,
      });
      setRiskDetectRules(rawData);
      setLoading(false);
    }
  };
  const exReload = async (args: ITableLoadOptions) => {
    const { searchValue } = args ?? {};
    if (riskLevel?.value) {
      setLoading(true);
      const rawData = await listRiskDetectRules({
        riskLevelId: riskLevel?.value,
        name: searchValue,
      });
      setRiskDetectRules(rawData);
      setLoading(false);
    }
  };
  const handleItemClick = (item: RiskLevelMapProps) => {
    getListRiskDetectRules(item);
    setRiskLevel(item);
    setSelectedItem(item?.value);
  };

  const initSiderData = async (riskLevels?: IRiskLevel[]) => {
    const nameMap = new Map();
    const rawData = riskLevels?.map(getRuleDecetedList)?.filter((riskDetectRule) => {
      if (!nameMap.has(riskDetectRule?.value)) {
        nameMap.set(riskDetectRule.value, riskDetectRule.label);
        return riskDetectRule;
      }
    });
    rawData?.length > 0 && handleItemClick(rawData[0]);
    rawData?.length > 0 && setSiderItemList(rawData);
  };
  const initRiskDetectRules = async () => {
    setSiderLoading(true);
    const rawData = await listRiskLevels();
    initSiderData(rawData);
    setSiderLoading(false);
  };
  useEffect(() => {
    initRiskDetectRules();
  }, []);
  return (
    <SecureLayout>
      <SecureSider
        loading={siderLoading}
        siderItemList={siderItemList}
        selectedItem={selectedItem}
        handleItemClick={handleItemClick}
      />
      <InnerRiskDetectRules
        {...{
          loading,
          exSearch,
          exReload,
          userStore,
          riskLevel,
          selectedItem,
          riskDetectRules,
          getListRiskDetectRules,
        }}
      />
    </SecureLayout>
  );
};
export default inject('userStore')(observer(RiskDetectRules));
