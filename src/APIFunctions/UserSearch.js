import axios from 'axios';
import { UserApiResponse } from './ApiResponses';
import { BASE_API_URL, membershipState, userFilterType } from '../Enums';

/**
 * Queries the database for all users.
 * @param {string} token The jwt token for verification
 * @returns {UserApiResponse} Containing any error information or the array of
 * users.
 */
export async function searchAllUsers({
  token,
  query = null,
  page = null,
  sortColumn = null,
  sortOrder = null,
}) {
  const url = new URL('/api/UserSearch/shortcutsearchusers', BASE_API_URL);

  if (sortColumn) {
    url.searchParams.set('sort', sortColumn);
  }

  if (sortOrder) {
    url.searchParams.set('order', sortOrder);
  }

  let status = new UserApiResponse();
  await axios
    // get all users!
    .post(
      url.href,
      {
        query,
        page,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    )
    .then(result => {
      status.responseData = result.data;
    })
    .catch(() => {
      status.error = true;
    });
  return status;
}
