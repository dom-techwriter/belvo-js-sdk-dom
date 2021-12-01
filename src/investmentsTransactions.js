import moment from 'moment';
import Resource from './resources';

/**
 * An InvestmentsTransaction gets the existing transactions for an instrument
 * @extends Resource
 */
class InvestmentsTransaction extends Resource {
  #endpoint = 'investments/transactions/'

  /**
   * Retrieve investments transactions from an existing link.
   * @async
   * @param {string} link - UUID4 representation of a Link Id.
   * @param {string} dateFrom - Required date from, format is YYYY-MM-DD.
   * @param {object} options - Optional parameters (dateTo, token, saveData, account)
   * @returns {object} Response
   * @throws {RequestError}
   */
  async retrieve(link, dateFrom, options = {}) {
    const {
      token, saveData, account,
    } = options;
    let {
      dateTo,
    } = options;
    if (!dateTo) {
      dateTo = moment().format('YYYY-MM-DD');
    }
    const result = await this.session.post(this.#endpoint, {
      link,
      token,
      date_from: dateFrom,
      date_to: dateTo,
      account,
      save_data: saveData,
    });
    return result;
  }
}

export default InvestmentsTransaction;
