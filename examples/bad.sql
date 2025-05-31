-- Example of SQL with multiple linting issues

-- Issue: SELECT * usage
select * from users;

-- Issue: lowercase keywords
select id, name from customers where active = 1;

-- Issue: Mixed case keywords
Select u.id, u.name
From users u
Left Join orders o On u.id = o.user_id
Where u.active = 1
Order By u.created_at Desc;

-- Issue: Single letter alias
select * 
from users u
join orders o on u.id = o.user_id
where o.status = 'pending';

-- Multiple issues in one query
select *
from customers c
where c.country in ('US', 'UK', 'CA')
and c.created_at between '2023-01-01' and '2023-12-31'
order by c.revenue desc
limit 50;