select * from users u
           where u.active = 1
           and u.created_at > '2023-01-01'
           order by u.created_at desc
