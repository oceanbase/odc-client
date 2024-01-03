/*
 * Copyright 2024 OceanBase
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/*
 * Copyright 2023 OceanBase
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { MaskRuleHashType, MaskRuleSegmentsType, MaskRuleType } from '@/d.ts';
import { formatMessage } from '@/util/intl';

export const segmentsMap = {
  [MaskRuleType.MASK]: [
    {
      label: formatMessage({
        id: 'odc.components.FormMaskDataModal.config.ShowPreviousAndLater',
      }), //展示前一后一
      value: MaskRuleSegmentsType.PRE_1_POST_1,
    },

    {
      label: formatMessage({
        id: 'odc.components.FormMaskDataModal.config.ShowTheFirstThreeAnd',
      }), //展示前三后二
      value: MaskRuleSegmentsType.PRE_3_POST_2,
    },

    {
      label: formatMessage({
        id: 'odc.components.FormMaskDataModal.config.ShowTheFirstThreeAnd.1',
      }), //展示前三后四
      value: MaskRuleSegmentsType.PRE_3_POST_4,
    },

    {
      label: formatMessage({
        id: 'odc.components.FormMaskDataModal.config.CustomSegmentation',
      }), //自定义分段
      value: MaskRuleSegmentsType.CUSTOM,
      options: [
        {
          label: formatMessage({
            id: 'odc.components.FormMaskDataModal.config.NotCoveredUp',
          }), //不掩盖
          value: false,
        },

        {
          label: formatMessage({
            id: 'odc.components.FormMaskDataModal.config.CoverUp',
          }), //掩盖
          value: true,
        },
      ],
    },
  ],

  [MaskRuleType.SUBSTITUTION]: [
    {
      label: formatMessage({
        id: 'odc.components.FormMaskDataModal.config.ReplaceAll',
      }), //替换全部
      value: MaskRuleSegmentsType.ALL,
    },

    {
      label: formatMessage({
        id: 'odc.components.FormMaskDataModal.config.ReplaceTheFirstThree',
      }), //替换前三位
      value: MaskRuleSegmentsType.PRE_3,
    },

    {
      label: formatMessage({
        id: 'odc.components.FormMaskDataModal.config.ReplaceTheLastFourDigits',
      }), //替换后四位
      value: MaskRuleSegmentsType.POST_4,
    },

    {
      label: formatMessage({
        id: 'odc.components.FormMaskDataModal.config.CustomSegmentation',
      }), //自定义分段
      value: MaskRuleSegmentsType.CUSTOM,
      options: [
        {
          label: formatMessage({
            id: 'odc.components.FormMaskDataModal.config.NotReplaced',
          }), //不替换
          value: false,
        },

        {
          label: formatMessage({
            id: 'odc.components.FormMaskDataModal.config.Replace',
          }), //替换
          value: true,
        },
      ],
    },
  ],
};

export const maskOptions = [
  {
    label: formatMessage({
      id: 'odc.components.FormMaskDataModal.config.CoverUp',
    }), //掩盖
    value: MaskRuleType.MASK,
    tips: formatMessage({
      id: 'odc.components.FormMaskDataModal.config.ReplaceTheMaskWithFor',
    }), //对应敏感字符用 * 替换掩盖，保留原始数据长度
    segmentOptions: segmentsMap[MaskRuleType.MASK],
  },

  {
    label: formatMessage({
      id: 'odc.components.FormMaskDataModal.config.CharacterReplacement',
    }), //字符替换
    value: MaskRuleType.SUBSTITUTION,
    tips: formatMessage({
      id: 'odc.components.FormMaskDataModal.config.ReplaceTheCorrespondingSensitiveCharacter',
    }), //对应敏感字符用替换值进行替换，不保留原始数据长度
    segmentOptions: segmentsMap[MaskRuleType.SUBSTITUTION],
  },

  {
    label: formatMessage({
      id: 'odc.components.FormMaskDataModal.config.ReservedFormat',
    }), //保留格式
    value: MaskRuleType.PSEUDO,
    tips: formatMessage({
      id: 'odc.components.FormMaskDataModal.config.ReplaceSensitiveCharactersWithCharacters',
    }), //对应敏感字符替换成相同类型的字符，保留原始数据的数据格式
  },
  {
    label: formatMessage({
      id: 'odc.components.FormMaskDataModal.config.HashEncryption',
    }), //哈希加密
    value: MaskRuleType.HASH,
    tips: formatMessage({
      id: 'odc.components.FormMaskDataModal.config.CalculateTheHashValueTo',
    }), //通过指定算法对数据进行运算，计算出哈希值替代原始数据
    hashOptions: [
      {
        label: 'MD5',
        value: MaskRuleHashType.MD5,
      },

      {
        label: 'SHA256',
        value: MaskRuleHashType.SHA256,
      },

      {
        label: 'SHA512',
        value: MaskRuleHashType.SHA512,
      },

      {
        label: 'SM3',
        value: MaskRuleHashType.SM3,
      },
    ],
  },

  {
    label: formatMessage({
      id: 'odc.components.FormMaskDataModal.config.Rounding',
    }), //取整
    value: MaskRuleType.ROUNDING,
    tips: formatMessage({
      id: 'odc.components.FormMaskDataModal.config.ApplicableToNumericTypesYou',
    }), //适用于数值类型，支持保留小数点位数不超过5位
  },
  {
    label: formatMessage({
      id: 'odc.components.FormMaskDataModal.config.Empty',
    }), //置空
    value: MaskRuleType.NULL,
    tips: formatMessage({
      id: 'odc.components.FormMaskDataModal.config.TheOriginalDataIsSet',
    }), //原始数据将被置为空字符串
  },
];

export const floors = [
  '0.00000',
  '0.0000',
  '0.000',
  '0.00',
  '0.0',
  '0',
  '10',
  '100',
  '1,000',
  '1,000,0',
  '1,000,00',
  '1,000,000',
  '1,000,000,0',
  '1,000,000,00',
  '1,000,000,000',
];

export const getSliderData = () => {
  const masks = {};
  const maskStyles = {
    '0.00000': {
      left: '3%',
    },

    '1,000,000,000': {
      left: '95%',
    },
  };

  floors.forEach((item, index) => {
    masks[(140 / (floors.length - 1)) * index] = ['0.00000', '0', '1,000,000,000'].includes(item)
      ? {
          label: item,
          style: maskStyles[item] ?? null,
        }
      : null;
  });

  const options = floors.map((item, index) => ({
    label: item,
    value: (140 / (floors.length - 1)) * index,
  }));

  const originIndex = floors.findIndex((item) => item === '0');

  const getPrecisionOption = (decimal: boolean, precision: number) => {
    const precisionIndex = decimal ? originIndex - precision : originIndex + precision;
    return options?.[precisionIndex];
  };

  const getDecimalAndPrecision = (precision: number) => {
    const precisionIndex = options.findIndex((item) => item.value === precision);
    const _precision = precisionIndex - originIndex;
    const decimal = _precision < 0;
    return {
      decimal,
      precision: Math.abs(_precision),
    };
  };

  return {
    masks,
    originIndex,
    options,
    getPrecisionOption,
    getDecimalAndPrecision,
  };
};
