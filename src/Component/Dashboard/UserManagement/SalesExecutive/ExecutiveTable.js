import { MoreVert } from "@material-ui/icons";
import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { executiveStatus } from "./executiveapis";
import { createContextExecutive } from "./ExecutiveContext";
import moment from "moment";
import "datatables.net-dt/js/dataTables.dataTables";
import "datatables.net-dt/css/jquery.dataTables.min.css";
import { authContext } from "../../../../Context/authContext";
import { toast } from "react-toastify";
var $ = require("jquery");



const ExecutiveTable = () => {
  const {
    getExecutives,
    distLoading,
    executive,
    handleView,
    editHandleExecutive,
  } = useContext(createContextExecutive);
  const { checkAdmin, cookie, token, logout } = useContext(authContext);



  const handleStatus = (id, status) => {
    const { ID } = token;
    var is_active = status === "Active" ? "InActive" : "Active";
    executiveStatus({ id, is_active }, ID).then((el) => {
      getExecutives();
    }).catch((err) => {
      if (err.response.status === 401) {
        toast.error(err.response.data.message);
        logout();
      }
    });
  };



  if (distLoading) {
    return (
      <div className="loading-gif">
        <img
          src="https://i.pinimg.com/originals/65/ba/48/65ba488626025cff82f091336fbf94bb.gif"
          alt="some"
        />
      </div>
    );
  }

  if (!distLoading) {
    setTimeout(() => {
      $("#execTable").DataTable({
        responsive: true,
        orderCellsTop: false,
        bRetrieve: true,
        initComplete: function () {
          this.api()
            .columns(".select-filter")
            .every(function () {
              var column = this;
              var select = $('<select class="form-control form-control-sm col-3 mx-3 my-2" ><option value=""></option></select>')
                .appendTo($('#execfilter'))
                .on("change", function () {
                  var val = $.fn.dataTable.util.escapeRegex($(this).val());

                  column.search(val ? "^" + val + "$" : "", true, false).draw();
                });
              return column
                .data()
                .unique()
                .sort()
                .each(function (d, j) {
                  select.append('<option value="' + d + '">' + d + "</option>");
                });
            });
        },
      });
    }, 1);
  }

  var filterExecutive = [];
  if (!checkAdmin()) {
    filterExecutive = executive.filter((items) => {
      const { authToken } = cookie;
      var data;
      if (items.manager) {
        data = items.manager._id === authToken._id;
      } else {
        data = null;
      }
      return data;
    });
  } else {
    filterExecutive = executive;
  }


  return (
    <div className="row">
      <div className="col-lg-12">
        <div className="row">
          <div className="col-3">Status</div>
        </div>
        <div className="row pb-3" id="execfilter">
        </div>
        <div className="table-responsive">
          <table id="execTable" className="table-hover mb-0 table">
            <thead>
              <tr>
                <th>#</th>
                <th>Employee ID</th>
                <th>Name</th>
                <th>Email ID</th>
                <th>Contact Number</th>
                <th>Sales Manager</th>
                <th>Added On</th>
                <th className="select-filter">Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filterExecutive.map((items, i) => {
                const {
                  _id,
                  name,
                  is_active,
                  createdAt,
                  employee_id,
                  email_id,
                  contact_no,
                  manager,
                } = items;
                const { name: manager_name } = manager || {};
                return (
                  <tr key={i}>
                    <td>{i + 1}</td>
                    <th>{employee_id}</th>
                    <td className="text-capitalize">{name}</td>
                    <td>{email_id}</td>
                    <td>{contact_no}</td>
                    <td className="text-capitalize">
                      {manager_name || <b>No Data</b>}
                    </td>
                    <td>{moment(createdAt).format("DD-MMM-YYYY")}</td>
                    <td
                      className={`m-3 badge light ${is_active === "InActive"
                        ? "badge-danger"
                        : "badge-success"
                        }`}>
                      {is_active}
                    </td>
                    <td>
                      <div className="btn-group dropend p-0 mx-auto">
                        <li
                          type="button"
                          className="rounded dropdown-toggle"
                          data-bs-toggle="dropdown">
                          <MoreVert />
                        </li>
                        <ul
                          className="dropdown-menu dropdown-menu-dark"
                          aria-labelledby="navbarDarkDropdownMenuLink">
                          <li>
                            <Link
                              to={`${checkAdmin()
                                ? "/salesexecutive/view"
                                : "/manager_salesexecutive/view"
                                }`}
                              onClick={() => handleView(items)}
                              className="dropdown-item">
                              View
                            </Link>
                          </li>
                          <li>
                            <Link
                              to={`${checkAdmin()
                                ? "/salesexecutive/edit"
                                : "/manager_salesexecutive/edit"
                                }`}
                              onClick={() => editHandleExecutive(_id, items)}
                              className="dropdown-item">
                              Edit
                            </Link>
                          </li>
                          <li>
                            <span onClick={() => handleStatus(_id, is_active)}
                              className="dropdown-item">
                              Change Status
                            </span>
                          </li>
                        </ul>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ExecutiveTable;
