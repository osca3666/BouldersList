reviews_sql = "INSERT INTO review (business_id, user_id, rating, review_text) VALUES\n"

# Define review texts for different rating levels
review_texts_low = ["Needs improvement.", "Not satisfied.", "Below expectations."]
review_texts_medium = ["Average experience.", "Decent service.", "Good but can improve."]
review_texts_high = ["Great service!", "Excellent experience!", "Highly recommend!"]

for business_id in range(1, 101):
    for review_num in range(3):  # Three reviews per business
        user_id = ((business_id - 1) * 3 + review_num) % 50 + 1  # Cycle through 50 users
        rating = (business_id + review_num) % 5 + 1  # Generate a rating from 1 to 5

        # Select review text based on rating
        if rating > 3:
            text = review_texts_high[rating - 4]
        elif rating > 1:
            text = review_texts_medium[rating - 2]
        else:
            text = review_texts_low[rating - 1]

        reviews_sql += "({}, {}, {}, '{}'),\n".format(business_id, user_id, rating, text)

reviews_sql = reviews_sql.rstrip(",\n") + ";"
print(reviews_sql)



# List of 50 popular names
names = [
    "Liam", "Emma", "Noah", "Olivia", "William", "Ava", "James", "Isabella", 
    "Oliver", "Sophia", "Benjamin", "Charlotte", "Elijah", "Mia", "Lucas", 
    "Amelia", "Mason", "Harper", "Logan", "Evelyn", "Alexander", "Abigail", 
    "Ethan", "Emily", "Jacob", "Elizabeth", "Michael", "Sofia", "Daniel", 
    "Avery", "Henry", "Ella", "Jackson", "Scarlett", "Sebastian", "Grace", 
    "Aiden", "Chloe", "Matthew", "Victoria", "Samuel", "Riley", "David", 
    "Aria", "Joseph", "Lily", "Carter", "Aubrey", "Owen", "Zoey", "Wyatt", 
    "Lillian", "John", "Addison"
]

users_sql = "INSERT INTO users (username, password) VALUES\n"

for i in range(50):
    username = names[i]
    password = "Password{}".format(i + 1)
    users_sql += "('{}', '{}')".format(username, password)
    users_sql += ",\n" if i < 49 else ";"

print(users_sql)

