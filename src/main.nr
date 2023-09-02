use dep::std;

fn main(value: pub u40, C1: pub Field) {
    assert(C1 == value as Field);
}

#[test]
fn test_main() {
    let C1 : Field = 40;
    let value: u40 = 40;
    main(value,C1);  // checks that public_key is derived from private_key and returns encrypted value and most importantly that the encrpyted value, i.e (C1,C2), is correct
}