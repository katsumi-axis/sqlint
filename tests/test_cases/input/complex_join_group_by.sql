select d.name, count(e.id) from departments d join employees e on d.id = e.department_id group by d.name;
