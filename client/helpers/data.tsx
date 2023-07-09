
import { IData } from "../../server/types/playlist";

export const formatData = (data: IData) => {
  return Object.entries(data).reduce((accumulator1, [key1, value1]: any) => {
    return {
      ...accumulator1,
      [key1]: Object.entries(value1).reduce((accumulator2, [key2, value2]: any) => {
        return {
          ...accumulator2,
          [key2]: value2.map(({ id, index }: any) => ({
            id,
            index: index + 1
          }))
        }
      }, {})
    }
  }, {})
}
