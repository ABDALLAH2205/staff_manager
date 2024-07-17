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
  Grid,
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
import { useSnackbar } from 'notistack';
import { useDispatch, useSelector } from 'react-redux';
import { deleteUser, fetchAllUsers } from 'src/redux/slices/user';
import { ACTION_USERS_DELETE } from '../create-request-form/ids.constant';
import { AppWidgetSummary } from 'src/sections/@dashboard/general/app';
import { useTheme } from '@emotion/react';

// ----------------------------------------------------------------------

const STATUS_OPTIONS = ['all'];

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
  { id: 'company', label: 'Nombre de demandes', align: 'left' },
  { id: 'role', label: 'Fonction', align: 'left' },
  { id: 'isVerified', label: 'Administrateur', align: 'center' },
  // { id: 'status', label: 'Status', align: 'left' },
  { id: '' },
];

// ----------------------------------------------------------------------

UserList.getLayout = function getLayout(page) {
  return <Layout>{page}</Layout>;
};
// ----------------------------------------------------------------------

export default function UserList() {
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

  const theme = useTheme();

  const { push } = useRouter();

  const [tableData, setTableData] = useState(_userList);

  const [filterName, setFilterName] = useState('');

  const [filterRole, setFilterRole] = useState('all');

  const { currentTab: filterStatus, onChangeTab: onChangeFilterStatus } = useTabs('all');

  const { user, users } = useSelector((state) => state.user);

  const { enqueueSnackbar } = useSnackbar();

  const dispatch = useDispatch();

  const handleFilterName = (filterName) => {
    setFilterName(filterName);
    setPage(0);
  };

  const handleFilterRole = (event) => {
    setFilterRole(event.target.value);
  };

  const handleDeleteRow = (id) => {
    dispatch(deleteUser({ id: id }));
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

  /**
   * Initiates a refresh action by dispatching a request to fetch all users.
   *
   * @return {void}
   */
  const handleRefresh = () => {
    dispatch(fetchAllUsers());
  };

  const usersFiltered = () => {
    let data = [];

    if (users && users.list) {
      data = users.list;
    }

    if (data && data.length > 0) {
      if (filterName && filterName != '') {
        data = data.filter((user) => {
          // const fields = ['nomemp', 'premp', 'email', 'matemp', 'foncemp', 'password', 'type', 'status'];

          return (
            user.nomemp.toLowerCase().indexOf(filterName.toLowerCase()) !== -1 ||
            user.premp.toLowerCase().indexOf(filterName.toLowerCase()) !== -1 ||
            user.matemp.toLowerCase().indexOf(filterName.toLowerCase()) !== -1 ||
            user.foncemp.toLowerCase().indexOf(filterName.toLowerCase()) !== -1 ||
            user.email.toLowerCase().indexOf(filterName.toLowerCase()) !== -1
          );
        });
      }

      data = data.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
    }

    return data;
  };

  // FETCH ALL DATA
  useEffect(() => {
    if ((users && !users.list) || (users && !users.list.length)) {
      dispatch(fetchAllUsers());
    }
  }, [dispatch]);

  // * ON_SUCCESS_DELETE
  useEffect(() => {
    if (users && !users.isLoading && users.actionType === ACTION_USERS_DELETE) {
      if (users.success) {
        enqueueSnackbar('Suppression effectuée', { variant: 'success' });
        // dispatch(initUserRequest());
        dispatch(fetchAllUsers());
      }
    }
  }, [users, enqueueSnackbar, dispatch]);

  return (
    <Page title="User: List">
      <Container maxWidth={themeStretch ? false : 'lg'}>
        <HeaderBreadcrumbs
          heading="Liste des utilisateurs"
          links={[
            { name: 'Tableau de bord' }, // href: PATH_DASHBOARD.root
            // { name: 'User', href: PATH_DASHBOARD.user.root },
            { name: 'Liste' },
          ]}
          action={
            <Button onClick={handleRefresh}>
              <Button variant="contained">
                <Iconify icon={'eva:refresh-fill'} />
              </Button>
            </Button>
          }
        />

        {users && users.list && (
          <Grid container spacing={3} my={2}>
            <Grid item xs={12} md={4} p={2}>
              <AppWidgetSummary title="Total" total={users && users.list && users.list.length} />
            </Grid>

            <Grid item xs={12} md={4} p={2}>
              <AppWidgetSummary
                title="Administrateur(s)"
                total={users && users.list && users.list.filter((user) => user.isAdmin).length}
              />
            </Grid>

            <Grid item xs={12} md={4} p={2}>
              <AppWidgetSummary
                title="Utilisateur(s)"
                total={users && users.list && users.list.filter((user) => !user.isAdmin).length}
              />
            </Grid>
          </Grid>
        )}

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

          <UserTableToolbar
            filterName={filterName}
            filterRole={filterRole}
            onFilterName={handleFilterName}
            onFilterRole={handleFilterRole}
            optionsRole={ROLE_OPTIONS}
          />

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
                <TableHeadCustom
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
                  {usersFiltered().map((row) => (
                    <UserTableRow
                      key={row.id}
                      row={row}
                      selected={selected.includes(row.id)}
                      onSelectRow={() => onSelectRow(row.id)}
                      onDeleteRow={() => handleDeleteRow(row.id)}
                      onEditRow={() => handleEditRow(row.name)}
                    />
                  ))}

                  {usersFiltered().length === 0 && (
                    <>
                      <TableEmptyRows height={denseHeight} emptyRows={emptyRows(page, rowsPerPage, tableData.length)} />
                      <TableNoData isNotFound={isNotFound} />
                    </>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Scrollbar>

          <Box sx={{ position: 'relative' }}>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={usersFiltered().length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={onChangePage}
              onRowsPerPageChange={onChangeRowsPerPage}
              labelRowsPerPage="Lignes par page"
              labelDisplayedRows={({ from, to, count }) => `${from}–${to} de ${count !== -1 ? count : `plus de ${to}`}`}
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
