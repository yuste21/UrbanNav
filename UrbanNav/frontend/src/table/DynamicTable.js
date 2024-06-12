import React, { useState, useMemo, useEffect } from "react";
import { Table, Pagination, Form } from "react-bootstrap";
import 'bootstrap-icons/font/bootstrap-icons.css';

const DynamicTable = ({ data, columns }) => {
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    console.log('Data 0 = ' + JSON.stringify(data[0]))

    const onSort = (columnKey) => {
        let direction = 'asc';
        let key = null;
        if (sortConfig.key === columnKey && sortConfig.direction === 'asc') {
            direction = 'desc';
            key = columnKey;
        } else if (sortConfig.key === columnKey && sortConfig.direction === 'desc') {
            key = null;
        } else {
            key = columnKey;
        }
        setSortConfig({ key, direction });
    };

    const sortedData = useMemo(() => {
        if (sortConfig.key) {
            return [...data].sort((a, b) => {
                if (a[sortConfig.key] < b[sortConfig.key]) {
                    return sortConfig.direction === 'asc' ? -1 : 1;
                }
                if (a[sortConfig.key] > b[sortConfig.key]) {
                    return sortConfig.direction === 'asc' ? 1 : -1;
                }
                return 0;
            });
        }
        return data;
    }, [data, sortConfig]);

    const paginatedData = useMemo(() => {
        const startIndex = (currentPage - 1) * rowsPerPage;
        const endIndex = startIndex + rowsPerPage;
        return sortedData.slice(startIndex, endIndex);
    }, [sortedData, currentPage, rowsPerPage]);

    const totalPages = Math.ceil(sortedData.length / rowsPerPage);

    const getSortIcon = (columnKey) => {
        if (sortConfig.key !== columnKey) {
            return null;
        }
        return sortConfig.direction === 'asc' ? (
            <i className="bi bi-arrow-down"></i>
        ) : (
            <i className="bi bi-arrow-up"></i>
        );
    };

    const handleRowsPerPageChange = (event) => {
        setRowsPerPage(Number(event.target.value));
        setCurrentPage(1);
    };

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    useEffect(() => {
        console.log(JSON.stringify(paginatedData))
    }, [])

    const getPageNumbers = () => {
        const pages = [];
        const maxPages = 7;
        const half = Math.floor(maxPages / 2);
        let start = Math.max(currentPage - half, 1);
        let end = Math.min(start + maxPages - 1, totalPages);

        if (end - start + 1 < maxPages) {
            start = Math.max(end - maxPages + 1, 1);
        }

        for (let i = start; i <= end; i++) {
            pages.push(i);
        }
        return pages;
    };

    return (
        <div>
            <Form.Group controlId="rowsPerPageSelect">
                <Form.Label>Filas por página:</Form.Label>
                <Form.Control as="select" value={rowsPerPage} onChange={handleRowsPerPageChange}>
                    {[10, 20, 50, 100].map(size => (
                        <option key={size} value={size}>{size}</option>
                    ))}
                </Form.Control>
            </Form.Group>
            <Table striped bordered hover>
                <thead>
                    <tr>
                        {columns.map((column, index) => (
                            <th key={index} onClick={() => onSort(column.accessor)}>
                                {column.header}
                                <span className="dt-column-order">
                                    {getSortIcon(column.accessor)}
                                </span>
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {paginatedData.map((item, rowIndex) => (
                        <tr key={rowIndex}>
                            {columns.map((column, columnIndex) => (
                                <td key={columnIndex}>{item[column.accessor]}</td>
                            ))}
                        </tr>
                    ))}
                </tbody>
                <tfoot>
                    <tr>
                        <td colSpan={columns.length}>
                            <Pagination>
                                <Pagination.First onClick={() => handlePageChange(1)} disabled={currentPage === 1} />
                                <Pagination.Prev onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} />
                                {getPageNumbers().map((page) => (
                                    <Pagination.Item key={page} active={page === currentPage} onClick={() => handlePageChange(page)}>
                                        {page}
                                    </Pagination.Item>
                                ))}
                                <Pagination.Next onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} />
                                <Pagination.Last onClick={() => handlePageChange(totalPages)} disabled={currentPage === totalPages} />
                            </Pagination>
                        </td>
                    </tr>
                </tfoot>
            </Table>
        </div>
    );
};

export default DynamicTable;
