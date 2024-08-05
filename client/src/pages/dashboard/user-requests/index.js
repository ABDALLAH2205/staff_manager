import { paramCase } from 'change-case';
import { useEffect, useState } from 'react';
// next
import NextLink from 'next/link';
import { useRouter } from 'next/router';
// @mui
import {
  Box,
  Tab,
  Tabs,
  Card,
  Table,
  Switch,
  Button,
  Tooltip,
  Divider,
  TableBody,
  Container,
  IconButton,
  TableContainer,
  TablePagination,
  FormControlLabel,
  TableRow,
  TableCell,
} from '@mui/material';
// routes
import { PATH_DASHBOARD } from '../../../routes/paths';
// hooks
import useTabs from '../../../hooks/useTabs';
import useSettings from '../../../hooks/useSettings';
import useTable, { getComparator, emptyRows } from '../../../hooks/useTable';
// _mock_
import { _userList } from '../../../_mock';
// layouts
import Layout from '../../../layouts';
// components
import Page from '../../../components/Page';
import Iconify from '../../../components/Iconify';
import Scrollbar from '../../../components/Scrollbar';
import HeaderBreadcrumbs from '../../../components/HeaderBreadcrumbs';
import { TableEmptyRows, TableHeadCustom, TableNoData, TableSelectedActions } from '../../../components/table';
// sections
import { UserTableToolbar, UserTableRow } from '../../../sections/@dashboard/user/list';
import { useDispatch, useSelector } from 'react-redux';
import { useSnackbar } from 'notistack';
import { deleteUserRequest, getUserRequests } from 'src/redux/slices/user';
import TableUserRequestSkeleton from 'src/components/table/user-request/TableUserRequestSkeleton';
import { TableUserRequestHeadCustom } from 'src/components/table/user-request';
import UserRequestTableRow from 'src/sections/@dashboard/user/list/UserRequestTableRow';
import { ACTION_DELETE, ACTION_FETCH_ALL } from '../create-request-form/ids.constant';
import { isExpired } from 'src/utils/utils.util';
import EmptyContent from 'src/components/EmptyContent';
import UserRequestTableToolbar from 'src/sections/@dashboard/user/list/UserRequestTableToolbar';

// ----------------------------------------------------------------------

// const STATUS_OPTIONS = ['all', 'active', 'banned'];
const STATUS_OPTIONS = ['Liste des demandes'];

const ROLE_OPTIONS = [
  'all',
  'ux designer',
  'full stack designer',
  'backend developer',
  'project manager',
  'leader',
  'ui designer',
  'ui/ux designer',
  'front end developer',
  'full stack developer',
];

const TABLE_HEAD = [
  { id: 'name', label: 'Nom & Prénoms', align: 'left' },
  { id: 'mat', label: 'Matricule', align: 'left' },
  // { id: 'demande', label: 'demande', align: 'left' },
  { id: 'demande', label: 'demande', align: 'left' },
  { id: 'description', label: 'Description', align: 'left' },
  // { id: 'role', label: 'Role', align: 'left' },
  // { id: 'isVerified', label: 'Verified', align: 'center' },
  { id: 'status', label: 'Status', align: 'left' },
  { id: '' },
];

// ----------------------------------------------------------------------

UserRequestList.getLayout = function getLayout(page) {
  return <Layout>{page}</Layout>;
};
// ----------------------------------------------------------------------

export default function UserRequestList() {
  const {
    dense,
    page,
    order,
    orderBy,
    rowsPerPage,
    setPage,
    //
    selected,
    setSelected,
    onSelectRow,
    onSelectAllRows,
    //
    onSort,
    onChangeDense,
    onChangePage,
    onChangeRowsPerPage,
  } = useTable();

  const { themeStretch } = useSettings();

  const { push } = useRouter();
  const router = useRouter();

  const [tableData, setTableData] = useState(_userList);

  const [filterName, setFilterName] = useState('');

  const [filterRole, setFilterRole] = useState('all');

  const { currentTab: filterStatus, onChangeTab: onChangeFilterStatus } = useTabs('all');

  const { user, userRequest } = useSelector((state) => state.user);
  const { enqueueSnackbar } = useSnackbar();
  const dispatch = useDispatch();

  const handleFilterMatricule = (mat) => {
    setFilterName(mat);
    setPage(0);
  };

  const handleFilterRole = (event) => {
    setFilterRole(event.target.value);
  };

  const handleDeleteRow = (id) => {
    dispatch(deleteUserRequest({ id: id }));
  };

  const handleDeleteRows = (selected) => {
    const deleteRows = tableData.filter((row) => !selected.includes(row.id));
    setSelected([]);
    setTableData(deleteRows);
  };

  const handleEditRow = (id) => {
    push(PATH_DASHBOARD.user.edit(paramCase(id)));
  };

  const dataFiltered = applySortFilter({
    tableData,
    comparator: getComparator(order, orderBy),
    filterName,
    filterRole,
    filterStatus,
  });

  const denseHeight = dense ? 52 : 72;

  const isNotFound =
    (!dataFiltered.length && !!filterName) ||
    (!dataFiltered.length && !!filterRole) ||
    (!dataFiltered.length && !!filterStatus);

  const handleRefresh = () => {
    let payload = '';
    if (user && !user?.isAdmin && user?.id) {
      payload += `?user_id=${user?.id}`;
    }
    dispatch(getUserRequests(payload));
  };

  const listFiltered = () => {
    let list = [];

    if (userRequest && userRequest.requests && Array.isArray(userRequest.requests)) {
      list = userRequest.requests;
    }

    if (filterName && filterName != '') {
      list = list.filter(
        (item) =>
          (item &&
            item.user &&
            item.user.matemp &&
            item.user.matemp.toLowerCase().includes(filterName.toLowerCase())) ||
          (item &&
            item.user &&
            item.user.nomemp &&
            item.user.nomemp.toLowerCase().includes(filterName.toLowerCase())) ||
          (item &&
            item.user &&
            item.user.prenomp &&
            item.user.prenomp.toLowerCase().includes(filterName.toLowerCase())) ||
          (item && item.user && item.user.matemp && item.user.matemp.toLowerCase().includes(filterName.toLowerCase()))
      );
    }

    return list;
  };

  /**
   * ? ----------------------------------------------
   * USE EFFECT START
   * ? ----------------------------------------------
   */

  // FETCH ALL DATA
  useEffect(() => {
    if ((userRequest && !userRequest.requests) || (userRequest && !userRequest.requests.length)) {
      let payload = '';
      if (user && !user?.isAdmin && user?.id) {
        payload += `?user_id=${user?.id}`;
      }
      dispatch(getUserRequests(payload));
    }
  }, [dispatch]);

  // * SHOW NOTIFICATION SUCCESS AFTER DELETE
  useEffect(() => {
    console.log(
      userRequest &&
        userRequest.actionType === ACTION_DELETE &&
        userRequest.success &&
        !isExpired(userRequest?.actionTimeExpire)
    );
    if (userRequest && userRequest.actionType === ACTION_DELETE && userRequest.success) {
      // if (!isExpired(userRequest?.actionTimeExpire)) {
      enqueueSnackbar('Demande supprimée avec succès');
      const payload = user && !user?.isAdmin && user?.id ? `?user_id=${user?.id}` : '';
      dispatch(getUserRequests(payload));
      // }
    }
  }, [dispatch, enqueueSnackbar, userRequest?.actionType, userRequest?.success, isExpired]);

  // ! SHOW NOTIFICATION ERROR AFTER DELETE
  useEffect(() => {
    if (userRequest && userRequest.actionType === ACTION_DELETE && !userRequest.success) {
      // if (!isExpired(userRequest?.actionTimeExpire)) {
      enqueueSnackbar('Oops! Echec de suppression', { variant: 'error' });
      // }
    }
  }, [dispatch, enqueueSnackbar, userRequest?.actionType, userRequest?.success, isExpired]);

  /**
   * ? ----------------------------------------------
   * ? USE EFFECT END
   * ? ----------------------------------------------
   */

  if (userRequest && userRequest?.requests?.length < 0) {
    return (
      <>
        <TableUserRequestSkeleton />
        <TableUserRequestSkeleton />
      </>
    );
  }

  useEffect(() => {
    if (router.query['new-logged'] === '1') {
      // router.replace(PATH_DASHBOARD.general.booking);

      // router.replace(window.location.pathname);
      window.location.replace(window.location.pathname);

      // router.reload();
    }
  }, [router]);

  return (
    <Page title="User: List">
      <Container maxWidth={themeStretch ? false : 'lg'}>
        <HeaderBreadcrumbs
          heading={user && user?.isAdmin ? 'Demandes' : 'Mes demandes'}
          links={[{ name: 'Dashboard', href: PATH_DASHBOARD.root }, { name: 'Demandes' }]}
          action={
            <Button onClick={handleRefresh}>
              {/* startIcon={<Iconify icon={'eva:refresh-fill'} />} */}
              <Button variant="contained">
                <Iconify icon={'eva:refresh-fill'} />
              </Button>
            </Button>
          }
        />

        <Card>
          <Tabs
            allowScrollButtonsMobile
            variant="scrollable"
            scrollButtons="auto"
            value={filterStatus}
            onChange={onChangeFilterStatus}
            sx={{ px: 2, bgcolor: 'background.neutral' }}
          >
            {STATUS_OPTIONS.map((tab) => (
              <Tab disableRipple key={tab} label={tab} value={tab} />
            ))}
          </Tabs>

          <Divider />

          <UserRequestTableToolbar
            filterName={filterName}
            filterRole={filterRole}
            onFilterName={handleFilterMatricule}
            onFilterRole={handleFilterRole}
            optionsRole={ROLE_OPTIONS}
          />

          {userRequest && userRequest.isLoading && userRequest.actionType === ACTION_FETCH_ALL && (
            <>
              <TableUserRequestSkeleton />
              <TableUserRequestSkeleton />
              <TableUserRequestSkeleton />
              <TableUserRequestSkeleton />
            </>
          )}

          <Scrollbar>
            <TableContainer sx={{ minWidth: 800, position: 'relative' }}>
              {selected.length > 0 && (
                <TableSelectedActions
                  dense={dense}
                  numSelected={selected.length}
                  rowCount={tableData.length}
                  onSelectAllRows={(checked) =>
                    onSelectAllRows(
                      checked,
                      tableData.map((row) => row.id)
                    )
                  }
                  actions={
                    <Tooltip title="Delete">
                      <IconButton color="primary" onClick={() => handleDeleteRows(selected)}>
                        <Iconify icon={'eva:trash-2-outline'} />
                      </IconButton>
                    </Tooltip>
                  }
                />
              )}

              <Table size={dense ? 'small' : 'medium'}>
                <TableUserRequestHeadCustom
                  order={order}
                  orderBy={orderBy}
                  headLabel={TABLE_HEAD}
                  rowCount={tableData.length}
                  numSelected={selected.length}
                  onSort={onSort}
                  onSelectAllRows={(checked) =>
                    onSelectAllRows(
                      checked,
                      tableData.map((row) => row.id)
                    )
                  }
                />

                <TableBody>
                  {/* {listFiltered().length < 0 && (
                    <TableRow>
                      <TableCell colSpan={6}>
                        <EmptyContent title="Aucune demande(s)" />
                      </TableCell>
                    </TableRow>
                  )} */}

                  {listFiltered() &&
                    listFiltered().length > 0 &&
                    listFiltered()
                      .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                      .map((row) => (
                        <UserRequestTableRow
                          key={row.id}
                          row={row}
                          selected={selected.includes(row.id)}
                          onSelectRow={() => onSelectRow(row.id)}
                          onDeleteRow={() => {
                            handleDeleteRow(row.id);
                          }}
                          onEditRow={() => handleEditRow(row.name)}
                        />
                      ))}

                  {listFiltered() && listFiltered().length <= 0 && (
                    <TableEmptyRows height={denseHeight} emptyRows={emptyRows(page, rowsPerPage, tableData.length)} />
                  )}

                  {listFiltered() && listFiltered().length <= 0 && <TableNoData isNotFound={isNotFound} />}
                </TableBody>
              </Table>
            </TableContainer>
          </Scrollbar>

          <Box sx={{ position: 'relative' }}>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={listFiltered().length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={onChangePage}
              onRowsPerPageChange={onChangeRowsPerPage}
              labelDisplayedRows={({ from, to, count }) => `${from}–${to} de ${count}`}
              labelRowsPerPage="Lignes par page:"
            />

            <FormControlLabel
              control={<Switch checked={dense} onChange={onChangeDense} />}
              label="Densité"
              sx={{ px: 3, py: 1.5, top: 0, position: { md: 'absolute' } }}
            />
          </Box>
        </Card>
      </Container>
    </Page>
  );
}

// ----------------------------------------------------------------------

function applySortFilter({ tableData, comparator, filterName, filterStatus, filterRole }) {
  const stabilizedThis = tableData.map((el, index) => [el, index]);

  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });

  tableData = stabilizedThis.map((el) => el[0]);

  if (filterName) {
    tableData = tableData.filter((item) => item.name.toLowerCase().indexOf(filterName.toLowerCase()) !== -1);
  }

  if (filterStatus !== 'all') {
    tableData = tableData.filter((item) => item.status === filterStatus);
  }

  if (filterRole !== 'all') {
    tableData = tableData.filter((item) => item.role === filterRole);
  }

  return tableData;
}
