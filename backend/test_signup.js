import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://malujpcvvkxbaqdkdexn.supabase.co'
const supabaseKey = 'sb_publishable_QGeYvr-nMZNNF1_Qa3haBg_kzD5-h13'
const supabase = createClient(supabaseUrl, supabaseKey)

async function testSignUp() {
    console.log("Testing generic signup...");
    const { data, error } = await supabase.auth.signUp({
        email: 'testuser123@gmail.com',
        password: 'password123'
    })

    if (error) {
        console.error("SignUp Error:", error.message);
    } else {
        console.log("SignUp Success! User ID:", data.user?.id);
    }
}

testSignUp();
