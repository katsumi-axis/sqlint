with EmployeeCTE as (select id, name, department_id from employees where salary > 50000) select e.name, d.name from EmployeeCTE e join departments d on e.department_id = d.id;
